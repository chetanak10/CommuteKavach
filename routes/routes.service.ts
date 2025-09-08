import { db } from "../db.js";
export async function createRoute(userId:number, r:any) {
  const q = `INSERT INTO saved_routes(user_id,name,from_lat,from_lng,to_lat,to_lng)
             VALUES($1,$2,$3,$4,$5,$6) RETURNING id`;
  const { rows } = await db.query(q, [userId, r.name, r.from.lat, r.from.lng, r.to.lat, r.to.lng]);
  return rows[0].id;
}
export async function getUserRoutes(userId:number) {
  const { rows } = await db.query("SELECT * FROM saved_routes WHERE user_id=$1 ORDER BY id DESC", [userId]);
  return rows;
}
export async function getRoute(userId:number, id:number) {
  const { rows } = await db.query("SELECT * FROM saved_routes WHERE user_id=$1 AND id=$2", [userId, id]);
  return rows[0] ?? null;
}
