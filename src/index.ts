#!/usr/bin/env node

import { createProject } from "./commands/create.command.js";
import { generateRoutes } from "./commands/generate.command.js";

const args = process.argv.slice(2);

if (args[0] === "create") {
  createProject();
} else if (args[0] === "generate") {
  generateRoutes();
} else {
  console.log(`
Uso:
  backend-generator create
`);
}
