import { app, BrowserWindow, ipcMain, session } from "electron";
import { makeLoginWindow } from "./src/components/loginWindow.js";
import type { Session } from "electron";
export let persistentSession: Session | null = null;

const createNewApp = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  persistentSession = session.fromPartition("persist:myapp");
  mainWindow.loadURL("http://localhost:5173");
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAccentColor("#637d91");


app.whenReady().then(createNewApp);

ipcMain.handle(`first-login`, async (_event, params: { url: string }) => {
  const result = await makeLoginWindow(params.url, persistentSession!);
  return result;
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
