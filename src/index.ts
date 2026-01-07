#!/usr/bin/env node

import { createProject } from "./commands/create.js";

const args = process.argv.slice(2);

if (args[0] === "create") {
  createProject();
} else {
  console.log(`
Uso:
  backend-generator create
`);
}
