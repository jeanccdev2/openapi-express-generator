import type { HttpMethod, OpenApiDocument } from "../openapi/types.js";
import type { GenerateProjectOptions } from "../commands/generate.command.js";
import { readOpenApiFile } from "../openapi/loader.js";
import { mainRouterTemplate } from "../templates/routes.js";
import fs from "fs";
import path from "path";
import { appExamplePath, appGeneratedPath } from "../index.js";
import { formatOpenApi, type FormatOpenApiResult } from "src/openapi/format.js";

function getDestPath(openapi: OpenApiDocument, relativePath: string[]) {
  return path.join(
    appGeneratedPath,
    openapi.info.title.toLowerCase().split(" ").join("_"),
    ...relativePath
  );
}

function writeFile(
  openapi: OpenApiDocument,
  relativePath: string[],
  content: string
) {
  const destPath = getDestPath(openapi, relativePath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
}

function copyFile(openapi: OpenApiDocument, relativePath: string[]) {
  const srcPath = path.join(appExamplePath, ...relativePath);
  const destPath = getDestPath(openapi, relativePath);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const exists = fs.existsSync(srcPath);
  if (!exists) {
    console.log("File does not exist", srcPath);
    return;
  }
  fs.copyFileSync(srcPath, destPath);
}

function getModules(openapi: OpenApiDocument) {
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

function setTsconfig(openapi: OpenApiDocument) {
  const modules = getModules(openapi);
  const destPath = getDestPath(openapi, ["tsconfig.json"]);
  const tsconfig = fs.readFileSync(destPath, "utf-8");
  let tsconfigJson = JSON.parse(tsconfig);
  for (const module of modules) {
    tsconfigJson.compilerOptions.paths[`@${module}/*`] = [
      `./src/modules/${module}/*`,
    ];
  }
  fs.writeFileSync(destPath, JSON.stringify(tsconfigJson, null, 2));
}

function importFiles(openapi: OpenApiDocument, relativePath: string[]) {
  const srcPath = path.join(appExamplePath, ...relativePath);
  const files = fs.readdirSync(srcPath, {
    withFileTypes: true,
  });
  for (const file of files) {
    if (file.isFile()) {
      copyFile(openapi, [...relativePath, file.name]);
      continue;
    }
  }
}

function generateIndexRoutes(
  openapi: OpenApiDocument,
  formatOpenApiResult: FormatOpenApiResult[]
) {}

function generateDefaultFiles(openapi: OpenApiDocument) {
  const relativePaths = [
    [""],
    ["src"],
    ["src", "config"],
    ["src", "helpers"],
    ["src", "scripts"],
    ["src", "shared"],
    ["src", "types"],
  ];
  for (const relativePath of relativePaths) {
    importFiles(openapi, relativePath);
  }
  setTsconfig(openapi);
}

function generateRoutes(openapi: OpenApiDocument, modules: string[]) {
  const mainRouter = mainRouterTemplate(modules);
  writeFile(openapi, ["src", "routes.ts"], mainRouter);
}

export async function generateFlow(options: GenerateProjectOptions) {
  try {
    const openapi = await readOpenApiFile(options.file_path);
    const modules = getModules(openapi);
    generateDefaultFiles(openapi);
    generateRoutes(openapi, modules);
    const formatOpenApiResult = formatOpenApi(openapi, modules);
    generateIndexRoutes(openapi, formatOpenApiResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
  }
}
