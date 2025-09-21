/* eslint-disable security/detect-non-literal-fs-filename */
import {
  app,
  BrowserWindow,
  ipcMain,
  session,
  autoUpdater,
  dialog,
} from "electron";
import { makeLoginWindow } from "./src/components/loginWindow.js";
import type { Session } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";
import { pipeline, env } from "@huggingface/transformers";
import fs from "fs";
// import fetch from 'node-fetch-cache';

export let persistentSession: Session | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userDataPath = app.getPath("userData");
const dbPath = app.isPackaged
  ? path.join(process.resourcesPath, "data", "local-db")
  : path.join(__dirname, "data", "local-db");

let iconWorker: Worker;
let rmpWorker: Worker;
let mainWindow: BrowserWindow;

// Ensure the data directory exists
const createNewApp = () => {
  try {
    mainWindow = new BrowserWindow({
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#2c3e50",
        symbolColor: "#74b1be",
        height: 30,
      },
      minWidth: 384,
      minHeight: 480,
      ...(process.platform === "darwin"
        ? { trafficLightPosition: { x: 16, y: 8 } }
        : {}),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "src", "preload.js"),
        devTools: true,
        enableBlinkFeatures: "EnableWebWorkerInspection",
      },
    });

    persistentSession = session.fromPartition("persist:login");
    if (app.isPackaged) {
      // Production mode: load the local index.html
      mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    } else {
      // Development mode: load from the Vite dev server
      mainWindow.loadURL("http://localhost:5173");
    }
    mainWindow.setMenuBarVisibility(false);
    mainWindow.maximize();
    autoUpdater.checkForUpdates();
  } catch (error) {
    console.error("Error occurred while creating the main window:", error);
  }
};

app.whenReady().then(createNewApp);

autoUpdater.on("update-downloaded", async () => {
  const response = await dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message:
      "A new version of the app is available. Would you like to restart and install?",
    buttons: ["Yes", "No"],
  });
  if (response === 0) {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.handle(`firstLogin`, async (_event, params: { url: string }) => {
  const result = await makeLoginWindow(params.url, persistentSession!);
  return result;
});

const getCookies = async (persistentSession: Session | null) => {
  if (persistentSession) {
    const cookies = await persistentSession.cookies.get({});
    const psTokens = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    return psTokens;
  }
  return null;
};

const fetchPage = async (
  url: string,
  psTokens: string,
  type: "Search" | "Detail" = "Search",
  pageNum: number = 1,
) => {
  let page;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      page = await fetch(`${url}&page=${pageNum}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: psTokens,
        },
      });
      if (page.ok) {
        const data = await page.json();
        if (data) {
          if (type === "Search") {
            return {
              success: true,
              numberOfPages: data.pageCount || 1,
              classes: data.classes || [],
            };
          } else {
            return { success: true, data };
          }
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        try {
          page = await makeLoginWindow(url, persistentSession!);
          if (page) {
            if (type === "Search") {
              page = page as unknown as {
                pageCount: number;
                classes: unknown[];
              };
              return {
                success: true,
                numberOfPages: page.pageCount || 1,
                classes: page.classes,
              };
            } else {
              return { success: true, data: page };
            }
          }
        } catch {
          return { success: false, numberOfPages: 0, classes: null };
        }
      }
    }
    await new Promise((res) => setTimeout(res, attempt * 1000)); // Exponential backoff
  }
  return { success: false, numberOfPages: 0, classes: null };
};

ipcMain.handle(
  "searchRequest",
  async (_event, params: { url: string; maxEntriesWarning: boolean }) => {
    // Handles the primary search request here
    const cookies = await getCookies(persistentSession);
    if (!cookies) {
      console.error("No cookies found");
      return { success: false, error: "No cookies found" };
    }
    const firstPageResult = await fetchPage(params.url, cookies);
    if (!firstPageResult.success) {
      return { success: false, error: "Failed to fetch the first page" };
    }
    const allClasses = [...firstPageResult.classes];
    const totalPages = firstPageResult.numberOfPages;

    if (totalPages > 10 && !params.maxEntriesWarning) {
      return {
        success: false,
        error: "Max retries reached",
        totalPages: totalPages,
      };
    }

    for (let page = 2; page <= totalPages; page++) {
      mainWindow.webContents.send("fetchProgress", page / totalPages);
      const pageResult = await fetchPage(params.url, cookies, "Search", page);
      if (pageResult.success && pageResult.classes) {
        allClasses.push(...pageResult.classes);
      } else {
        console.error(`Failed to fetch page ${page}`);
        return { success: false, error: `Failed to fetch page ${page}` };
      }
    }
    return { success: true, data: allClasses };
  },
);

ipcMain.handle("detailRequest", async (_event, params: { url: string }) => {
  // Handles the primary search request here
  const cookies = await getCookies(persistentSession);
  if (!cookies) {
    console.error("No cookies found");
    return { success: false, error: "No cookies found" };
  }
  const detailResult = await fetchPage(params.url, cookies, "Detail");
  if (!detailResult.success) {
    return { success: false, error: "Failed to fetch detail data" };
  }
  return { success: true, data: detailResult.data };
});

ipcMain.handle("getRMPInfo", async (_event, params: { school: string }) => {
  try {
    return new Promise((resolve, reject) => {
      if (!rmpWorker || rmpWorker.threadId === -1) {
        rmpWorker = new Worker(
          path.join(
            __dirname,
            "src",
            "workers",
            "rateMyProfessorQueryWorker.js",
          ),
          {
            workerData: { school: params.school },
          },
        );
      }
      rmpWorker.postMessage({ type: "query" });
      rmpWorker.on("message", (message) => {
        if (message.type === "result") {
          resolve({ data: message.data });
        }
      });
      rmpWorker.on("error", (err) => {
        console.error("RMP Worker error:", err);
        reject({ error: "RMP Worker encountered an error" });
        rmpWorker.terminate();
      });
    });
  } catch (error) {
    console.error("Error fetching RMP info:", error);
    return { error: "Failed to fetch RMP info" };
  }
});

ipcMain.handle("loadModel", async () => {
  if (fs.existsSync(path.join(userDataPath, "model-cache")) === false) {
    fs.mkdirSync(path.join(userDataPath, "model-cache"));
    env.allowRemoteModels = true;
    env.cacheDir = path.join(userDataPath, "model-cache");
    await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2",
    );
  }
  return new Promise<void>((resolve, reject) => {
    if (!iconWorker || iconWorker.threadId === -1) {
      // Check if the cache folder exists, if not create it
      iconWorker = new Worker(
        path.join(__dirname, "src", "workers", "modelWorker.js"),
        {
          workerData: { userDataPath, dbPath, isPackaged: app.isPackaged },
        },
      );
    }
    iconWorker.postMessage({ type: "loadModel" });
    iconWorker.on("message", (message) => {
      if (message.type === "modelLoaded") {
        resolve();
      }
    });
    iconWorker.on("error", (err) => {
      console.error("Worker error:", err);
      reject(err);
      iconWorker.terminate();
    });
  });
});

ipcMain.handle(
  "performIconSearch",
  async (
    _event,
    params: { query: { courses: { subject_descr: string }[] } },
  ) => {
    return new Promise<{ lib: string; name: string }[]>((resolve, reject) => {
      iconWorker.postMessage({
        type: "semanticSearch",
        courses: params.query.courses,
      });
      iconWorker.on("message", (message) => {
        if (message.type === "semanticSearchResults") {
          resolve(message.results);
        }
      });
      iconWorker.on("error", (err) => {
        console.error("Worker error during semantic search:", err);
        reject(err);
        iconWorker.terminate();
      });
    });
  },
);

app.on("window-all-closed", () => {
  if (iconWorker) {
    iconWorker.terminate();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
