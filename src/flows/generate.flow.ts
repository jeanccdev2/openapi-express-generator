import type { HttpMethod, OpenApiDocument } from "../openapi/types.js";
import type { GenerateProjectOptions } from "../commands/generate.command.js";
import { readOpenApiFile } from "../openapi/loader.js";
import { mainRouterTemplate } from "../templates/routes.js";
import fs from "fs";
import path from "path";
import { appExamplePath, appGeneratedPath } from "../index.js";
import { formatOpenApi, type FormatOpenApiResult } from "../openapi/format.js";
import { indexRoutesTemplate } from "../templates/index.routes.js";

let openapi: OpenApiDocument;

export async function generateFlow(options: GenerateProjectOptions) {
  try {
    openapi = await readOpenApiFile(options.file_path);
    if (!openapi) {
      throw new Error("OpenAPI document not found");
    }
    const modules = getModules();
    const formatOpenApiResult = formatOpenApi(openapi, modules);
    generateDefaultFiles();
    generateRoutes(modules);
    generateIndexRoutes(formatOpenApiResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(err, message);
  }
}

function generateDefaultFiles() {
  const relativePaths = [
    [""],
    ["src"],
    ["src", "config"],
    ["src", "helpers"],
    ["src", "scripts"],
    ["src", "shared"],
    ["src", "types"],
  ];

  // Import files
  for (const relativePath of relativePaths) {
    const srcPath = path.join(appExamplePath, ...relativePath);
    const files = fs.readdirSync(srcPath, {
      withFileTypes: true,
    });
    for (const file of files) {
      if (file.isFile()) {
        copyFile([...relativePath, file.name]);
        continue;
      }
    }
  }

  // Set tsconfig
  const modules = getModules();
  const destPath = getDestPath(["tsconfig.json"]);
  const tsconfig = fs.readFileSync(destPath, "utf-8");
  let tsconfigJson = JSON.parse(tsconfig);
  for (const module of modules) {
    tsconfigJson.compilerOptions.paths[`@${module}/*`] = [
      `./src/modules/${module}/*`,
    ];
  }
  fs.writeFileSync(destPath, JSON.stringify(tsconfigJson, null, 2));
}

function generateRoutes(modules: string[]) {
  const mainRouter = mainRouterTemplate(modules);
  const destPath = getDestPath(["src", "routes.ts"]);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, mainRouter);
}

function generateIndexRoutes(formatOpenApiResult: FormatOpenApiResult[]) {
  for (const module of formatOpenApiResult) {
    const { module: moduleName, routes } = module;
    const indexRoutes = indexRoutesTemplate(module);
    writeFile(["src", "modules", moduleName, "index.routes.ts"], indexRoutes);
  }
}

function getDestPath(relativePath: string[]) {
  return path.join(
    appGeneratedPath,
    openapi.info.title.toLowerCase().split(" ").join("_"),
    ...relativePath
  );
}

function getModules() {
  const modules: string[] = [
    ...new Set(
      Object.keys(openapi.paths)
        .map((path) => {
          const pathSplit = path.split("/");
          const module = pathSplit.length > 1 ? pathSplit[1] : null;
          return module;
        })
        .filter((module) => module != null)
    ),
  ];

  return modules;
}

function copyFile(relativePath: string[]) {
  const srcPath = path.join(appExamplePath, ...relativePath);
  const destPath = getDestPath(relativePath);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const exists = fs.existsSync(srcPath);
  if (!exists) {
    console.log("File does not exist", srcPath);
    return;
  }
  fs.copyFileSync(srcPath, destPath);
}

function writeFile(relativePath: string[], content: string) {
  const destPath = getDestPath(relativePath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
}
