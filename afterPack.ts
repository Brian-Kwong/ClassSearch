import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (context: {
  appOutDir: string;
  packager: { appInfo: { productFilename: unknown } };
}) {
  if (process.platform !== "darwin") {
    return; // Not macOS, exit early
  }
  const assetsCarPath = path.join(
    __dirname,
    "..",
    "buildResources",
    "Assets.car",
  );

  const appResourcesPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
    "Contents",
    "Resources",
    "Assets.car",
  );

  if (fs.existsSync(assetsCarPath)) {
    fs.copyFileSync(assetsCarPath, appResourcesPath);
  } else {
    console.error("❌ Assets.car not found at:", assetsCarPath);
  }
}
