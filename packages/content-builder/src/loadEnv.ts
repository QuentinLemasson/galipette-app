import dotenv from "dotenv";
import path from "node:path";

export function loadEnv(): void {
  dotenv.config({
    path: path.resolve(process.cwd(), "../../.env"),
  });
}