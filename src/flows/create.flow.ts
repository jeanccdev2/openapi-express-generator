import type { ORM } from "@/types/orm.js";
import fs from "fs";
import path from "path";

type FileFolder = {
  name: string;
  type: "file" | "folder";
  path: string[];
};

const appExamplePath = path.join(process.cwd(), "app_example");
const appGeneratedPath = path.join(process.cwd(), "app_generated");
const defaultFiles: FileFolder[] = [
  {
    name: "package.json",
    type: "file",
    path: ["/"],
  },
  {
    name: ".env",
    type: "file",
    path: ["/"],
  },
  {
    name: ".gitignore",
    type: "file",
    path: ["/"],
  },
  {
    name: ".prettierignore",
    type: "file",
    path: ["/"],
  },
  {
    name: ".prettierrc",
    type: "file",
    path: ["/"],
  },
  {
    name: "eslint.config.js",
    type: "file",
    path: ["/"],
  },
  {
    name: "package-lock.json",
    type: "file",
    path: ["/"],
  },
  {
    name: "tsconfig.json",
    type: "file",
    path: ["/"],
  },
];

export async function createFullProjectFlow(orm: ORM) {
  const files: FileFolder[] = [
    ...defaultFiles,

    {
      name: "config",
      type: "folder",
      path: ["src"],
    },
    {
      name: "helpers",
      type: "folder",
      path: ["src"],
    },
    {
      name: "shared",
      type: "folder",
      path: ["src"],
    },
    {
      name: "types",
      type: "folder",
      path: ["src"],
    },
    {
      name: "main.ts",
      type: "file",
      path: ["src"],
    },
    {
      name: "routes.ts",
      type: "file",
      path: ["src"],
    },

    {
      name: "example",
      type: "folder",
      path: ["src", "modules"],
    },
  ];

  for (const file of files) {
    copyFile(file);
  }
}

function copyFile(file: FileFolder) {
  console.log("file", file);
  const srcPath = path.join(appExamplePath, ...file.path, file.name);

  if (file.type === "file") {
    const destPath = path.join(appGeneratedPath, ...file.path, file.name);
    console.log("srcPath", srcPath);
    console.log("destPath", destPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    return fs.copyFileSync(srcPath, destPath);
  }

  if (file.type === "folder") {
    const dirFiles = fs.readdirSync(srcPath);
    for (const dirFile of dirFiles) {
      copyFile({
        name: dirFile,
        type: dirFile.includes(".") ? "file" : "folder",
        path: [...file.path, file.name],
      });
    }
  }
}
