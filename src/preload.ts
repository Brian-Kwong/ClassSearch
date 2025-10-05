import { contextBridge, ipcRenderer } from "electron";
declare global {
  interface Window {
    ipcRenderer?: typeof ipcRenderer;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  firstLogin: (url: string) => ipcRenderer.invoke("firstLogin", { url }),
  fetchCourses: (url: string, maxEntriesWarning: boolean) =>
    ipcRenderer.invoke("searchRequest", { url, maxEntriesWarning }),
  fetchCourseDetails: (url: string) =>
    ipcRenderer.invoke("detailRequest", { url }),
  getSystemTimeFormat: () => ipcRenderer.invoke("getSystemTimeFormat"),
  getModelPath: () => ipcRenderer.invoke("getModelPath"),
  getRMPInfo: (school: string) => ipcRenderer.invoke("getRMPInfo", { school }),
  semanticSearch: {
    performIconSearch: (query: { courses: { subject_descr: string }[] }) =>
      ipcRenderer.invoke("performIconSearch", { query }),
    setup: () => ipcRenderer.invoke("loadModel"),
  },
  onFetchProgress: (callback: (event: unknown, progress: number) => void) => {
    const listener = (_event: unknown, progress: number) =>
      callback(_event, progress);
    ipcRenderer.on("fetchProgress", listener);
    return () => {
      ipcRenderer.removeListener("fetchProgress", listener);
    };
  },
});

if (process.contextIsolated === false) {
  window.ipcRenderer = ipcRenderer;
}
