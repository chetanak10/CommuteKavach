import { request } from "undici";
import { cfg } from "../config.js";
export async function etaMinutes(from:{lat:number,lng:number}, to:{lat:number,lng:number}) {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${cfg.mapsKey}&overview=false`;
    const res = await request(url);
    const data = await res.body.json();
    const seconds = data.routes?.[0]?.duration ?? 900;
    return Math.ceil(seconds/60);
  } catch { return 15; }
}
