import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get workspace root relative to this file's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findWorkspaceRoot(startPath: string): string {
  let current = startPath;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(current, "turbo.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return path.resolve(startPath, "../../.."); // Fallback default
}

const workspaceRoot = findWorkspaceRoot(__dirname);
const dataDir = path.join(workspaceRoot, ".data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function readDbFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    // Write default value immediately to ensure the file exists
    writeDbFile(filename, defaultValue);
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
}

export function writeDbFile<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
