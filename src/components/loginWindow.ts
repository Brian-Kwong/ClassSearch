import { BrowserWindow } from "electron";

export const makeLoginWindow = (
  loginURL: string,
  userSession: Electron.Session,
) => {
  return new Promise((resolve: (value: unknown) => void) => {
    let results: unknown = null;
    try {
      let redirectCount = 0;
      const loginWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          session: userSession,
          partition: "persist:login",
        },
      });

      loginWindow.loadURL(loginURL);
      loginWindow.setMenuBarVisibility(false);
      loginWindow.on("closed", () => {
        resolve(results);
      });

      loginWindow.webContents.on("did-finish-load", () => {
        const url = loginWindow.webContents.getURL();
        if (url === loginURL) {
          redirectCount += 1;
          loginWindow.webContents
            .executeJavaScript('document.querySelector("pre").innerText')
            .then((data) => {
              try {
                results = JSON.parse(data);
                loginWindow.destroy();
              } catch {
                loginWindow.close();
              }
            })
            .catch(() => {
              if (redirectCount > 2) {
                loginWindow.close();
              }
            });
        }
      });
    } catch (error) {
      console.error("Error creating login window:", error);
    }
  });
};
