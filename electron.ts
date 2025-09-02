import { app, BrowserWindow, ipcMain, session } from "electron";
import { makeLoginWindow } from "./src/components/loginWindow.js";
import type { Session } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";
// import fetch from 'node-fetch-cache';

export let persistentSession: Session | null = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createNewApp = () => {
  try {
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        devTools: true,
        enableBlinkFeatures: "EnableWebWorkerInspection",
      },
    });
    persistentSession = session.fromPartition("persist:login");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.setMenuBarVisibility(false);
  } catch (error) {
    console.error("Error occurred while creating the main window:", error);
  }


app.whenReady().then(createNewApp);

ipcMain.handle(`firstLogin`, async (_event, params: { url: string }) => {
  const result = await makeLoginWindow(params.url, persistentSession!);
  return result;
});

ipcMain.handle("searchRequest", async (_event, params: { url: string }) => {
  // Handle the search request here
  const cookies = await persistentSession?.cookies.get({});
  try {
    if (cookies && cookies.length > 0) {
      for (let i = 0; i < cookies.length; i++) {
        const psTokens = cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ");
        const searchResults = await fetch(params.url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: psTokens,
          },
        });
        if (searchResults.ok) {
          try {
            const data = await searchResults.json();
            return { success: true, data 
          } catch {
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
      // Invoke first login
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
