import { Pool } from "pg";
import { cfg } from "./config.js";
export const db = new Pool({ connectionString: cfg.dbUrl });
