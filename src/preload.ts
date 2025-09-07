import { contextBridge, ipcRenderer } from "electron";
declare global {
  interface Window {
    ipcRenderer?: typeof ipcRenderer;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  firstLogin: (url: string) => ipcRenderer.invoke("firstLogin", { url }),
  fetchCourses: (url: string) => ipcRenderer.invoke("searchRequest", { url }),
  getModelPath: () => ipcRenderer.invoke("getModelPath"),
  semanticSearch: {
    performIconSearch: (query: { courses: { subject_descr: string }[] }) =>
      ipcRenderer.invoke("performIconSearch", { query }),
    setup: () => ipcRenderer.invoke("loadModel"),
  },
});

if (process.contextIsolated === false) {
  window.ipcRenderer = ipcRenderer;
}
