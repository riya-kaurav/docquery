
import "dotenv/config";
import { Client } from "pg";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log(" Connected to PostgreSQL");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await readFile(schemaPath, "utf-8");

    await client.query(schema);

    console.log(" Database initialized successfully");
  } catch (error) {
    console.error(" Failed to initialize database");
    console.error(error);
  } finally {
    await client.end();
    console.log("🔌 Connection closed");
  }
}

init();