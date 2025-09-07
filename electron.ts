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
import { error } from "console";
import { Worker } from 'worker_threads';
// import fetch from 'node-fetch-cache';

export let persistentSession: Session | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let worker: Worker;

const createNewApp = () => {
  try {
    const mainWindow = new BrowserWindow({
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

ipcMain.handle("searchRequest", async (_event, params: { url: string }) => {
  // Handles the primary search request here
  const cookies = await persistentSession?.cookies.get({});
  try {
    if (cookies && cookies.length > 0) {
      for (let i = 0; i < 5; i++) {
        const psTokens = cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ");
        const searchResults = await fetch(`${params.url}&page=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: psTokens,
          },
        });
        if (searchResults.ok) {
          try {
            const data = await searchResults.json();
            if (data) {
              // Check for additional pages
              if (data.pageCount > 1) {
                for (let i = 2; i <= data.pageCount; i++) {
                  try {
                    const pageResults = await fetch(`${params.url}&page=${i}`, {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                        Cookie: psTokens,
                      },
                    });
                    if (pageResults.ok) {
                      const pageData = await pageResults.json();
                      if (pageData) {
                        data.classes.push(...pageData.classes);
                      }
                    } else {
                      console.error(
                        "Error occurred while fetching page results:",
                        pageResults.statusText,
                      );
                    }
                  } catch {
                    i = i - 1;
                    continue;
                  }
                }
              }
              return { success: true, data 
            }
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          break;
        }
      }
      console.warn(
        "Error occurred during search request: Trying with new login",
        error,
      );
      try {
        const result = await makeLoginWindow(params.url, persistentSession!);
        return result;
      } catch (error) {
        console.error("Error occurred during login:", error);
        return {
          success: false,
          error: "An error occurred during the login process.",
        
      }
    } else {
      console.warn("No cookies found, initiating login process.");
      // Invoke first login to maybe resign in the user?
      const result = await makeLoginWindow(params.url, persistentSession!);
      return result;
    }
  } catch (error) {
    console.error("An unknown error occurred during search request:", error);
    return {
      success: false,
      error: "An error occurred during the search process.",
    
  }
});

ipcMain.handle("loadModel", async () => {
  return new Promise<void>((resolve, reject) => {
    if (!worker || worker.threadId === -1) {
      worker = new Worker(path.join(__dirname, 'src', 'modelWorker.js'));
    }
    worker.postMessage({ type: 'loadModel' });
    worker.on('message', (message) => {
      if (message.type === 'modelLoaded') {
        resolve();
      }
    });
    worker.on('error', (err) => {
      console.error("Worker error:", err);
      reject(err);
      worker.terminate();
    });
  });
});

ipcMain.handle("performIconSearch", async (_event, params: { query: { courses: { subject_descr: string }[] } }) => {
  return new Promise<{ lib: string; name: string }[]>((resolve, reject) => {
    worker.postMessage({ type: 'semanticSearch', courses: params.query.courses });
    worker.on('message', (message) => {
      if (message.type === 'semanticSearchResults') {
        resolve(message.results);
      }
    });
    worker.on('error', (err) => {
      console.error("Worker error during semantic search:", err);
      reject(err);
      worker.terminate();
    });
  });
});

app.on("window-all-closed", () => {
  if (worker) {
    worker.terminate();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
