import "reflect-metadata";
import { AppDataSource } from "@database/data-source.js";
import { SEEDERS } from "@/database/seeders/index.js";

type Command = "list" | "run" | "clear" | "refresh";

function parseCount(argv: string[]) {
  const idx = argv.findIndex((x) => x === "--count");
  if (idx === -1) return undefined;
  const value = argv[idx + 1];
  const parsed = value ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function parseName(argv: string[]) {
  const idx = argv.findIndex((x) => x === "--name");
  if (idx !== -1) {
    const value = argv[idx + 1];
    if (value && !value.startsWith("-")) return value;
  }

  const inferred = argv[3];
  if (inferred && !inferred.startsWith("-")) return inferred;
  return undefined;
}

async function main() {
  const command = (process.argv[2] as Command | undefined) ?? "list";
  const seederName = parseName(process.argv);
  const count = parseCount(process.argv);

  const dataSource = await AppDataSource.initialize();

  try {
    if (command === "list") {
      for (const s of SEEDERS) {
        console.log(s.name);
      }
      return;
    }

    const selected = seederName ? SEEDERS.filter((s) => s.name === seederName) : SEEDERS;

    if (seederName && selected.length === 0) {
      throw new Error(`Seeder not found: ${seederName}`);
    }

    if (command === "run") {
      for (const s of selected) {
        await s.run(dataSource, { count });
        console.log(`Seeded: ${s.name}`);
      }
      return;
    }

    if (command === "clear") {
      for (const s of [...selected].reverse()) {
        if (s.clear) {
          await s.clear(dataSource);
          console.log(`Cleared: ${s.name}`);
        }
      }
      return;
    }

    if (command === "refresh") {
      for (const s of [...selected].reverse()) {
        if (s.clear) {
          await s.clear(dataSource);
          console.log(`Cleared: ${s.name}`);
        }
      }

      for (const s of selected) {
        await s.run(dataSource, { count });
        console.log(`Seeded: ${s.name}`);
      }
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
