import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cfg } from "../config.js";

export async function register(email:string, password:string) {
  const hash = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users(email, password_hash) VALUES($1,$2) ON CONFLICT DO NOTHING", [email, hash]);
  return login(email, password);
}
export async function login(email:string, password:string) {
  const r = await db.query("SELECT id, password_hash FROM users WHERE email=$1", [email]);
  if (r.rowCount === 0) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if (!ok) throw new Error("Invalid credentials");
  const token = jwt.sign({ sub: r.rows[0].id }, cfg.jwtSecret, { expiresIn: "12h" });
  return token;
}
