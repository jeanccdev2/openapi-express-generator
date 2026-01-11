import type { CreateProjectOptions } from "@/commands/create.command.js";
import type { ORM } from "@/types/orm.js";
import fs, { Dirent } from "fs";
import path from "path";

function copyFile(projectName: string, orm: ORM, relativePath: string[]) {
  const srcPath = path.join(appExamplePath, ...relativePath);
  const destPath = path
    .join(appGeneratedPath, projectName, ...relativePath)
    .replace("_" + orm.toLowerCase(), "");

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const exists = fs.existsSync(srcPath);
  if (!exists) {
    console.log("File does not exist", srcPath);
    return;
  }
  fs.copyFileSync(srcPath, destPath);
}

const appExamplePath = path.join(process.cwd(), "app_example");
const appGeneratedPath = path.join(process.cwd(), "generated");

export async function createFullProjectFlow({
  project_name,
  orm,
}: CreateProjectOptions) {
  const dirFiles = fs
    .readdirSync(appExamplePath, {
      recursive: true,
      withFileTypes: true,
    })
    .filter((dirent) => {
      const isDatabaseDir = dirent.parentPath.includes("database");
      const isEntitiesDir = dirent.parentPath.includes("entities");

      return (
        dirent.isFile() &&
        (isDatabaseDir
          ? dirent.parentPath.includes("_" + orm.toLowerCase())
          : true) &&
        (isEntitiesDir
          ? dirent.parentPath.includes("_" + orm.toLowerCase())
          : true)
      );
    })
    .map((dirent) => {
      const splitPath = dirent.parentPath.split("app_example\\");
      const arrayPath = splitPath[1]?.split("\\");
      return [...(arrayPath || []), dirent.name];
    });

  for (const relativePath of dirFiles) {
    copyFile(project_name, orm, relativePath);
  }
}
