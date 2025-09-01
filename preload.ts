import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    ipcRenderer?: typeof ipcRenderer;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  firstLogin: (url: string) => ipcRenderer.invoke("firstLogin", { url }),
  fetchCourses: (url: string) => ipcRenderer.invoke("searchRequest", { url }),
});

if (process.contextIsolated === false) {
  window.ipcRenderer = ipcRenderer;
}
