import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const allowedLayersByLayer = {
  shared: new Set(["shared"]),
  entities: new Set(["shared", "entities"]),
  features: new Set(["shared", "entities", "features"]),
  widgets: new Set(["shared", "entities", "features", "widgets"]),
  pages: new Set(["shared", "entities", "features", "widgets", "pages"]),
  app: new Set(["shared", "entities", "features", "widgets", "pages", "app"]),
};

const layerOrder = ["shared", "entities", "features", "widgets", "pages", "app"];
const importRegex = /import\s+(?:[^"'`]+?\s+from\s+)?["'`]([^"'`]+)["'`]/g;

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      result.push(...walk(full));
      continue;
    }
    if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      result.push(full);
    }
  }
  return result;
}

function findLayerFromAbsolutePath(filePath) {
  const relative = path.relative(srcRoot, filePath).replaceAll("\\", "/");
  const layer = relative.split("/")[0];
  return layerOrder.includes(layer) ? layer : null;
}

function resolveImport(fromFile, source) {
  if (source.startsWith("@/")) {
    return path.join(srcRoot, source.slice(2));
  }

  if (source.startsWith("./") || source.startsWith("../")) {
    return path.resolve(path.dirname(fromFile), source);
  }

  return null;
}

function main() {
  const files = walk(srcRoot);
  const violations = [];

  for (const file of files) {
    const fileLayer = findLayerFromAbsolutePath(file);
    if (!fileLayer) continue;

    const code = fs.readFileSync(file, "utf8");
    for (const match of code.matchAll(importRegex)) {
      const source = match[1];
      const resolved = resolveImport(file, source);
      if (!resolved) continue;

      const targetLayer = findLayerFromAbsolutePath(resolved);
      if (!targetLayer) continue;

      const allowed = allowedLayersByLayer[fileLayer];
      if (!allowed?.has(targetLayer)) {
        violations.push({
          file: path.relative(projectRoot, file).replaceAll("\\", "/"),
          source,
          fileLayer,
          targetLayer,
        });
      }
    }
  }

  if (!violations.length) {
    console.log("Layer import check passed.");
    return;
  }

  console.error("Layer import rule violations found:\n");
  for (const item of violations) {
    console.error(
      `- ${item.file} imports \"${item.source}\" (${item.fileLayer} -> ${item.targetLayer})`
    );
  }

  process.exit(1);
}

main();
