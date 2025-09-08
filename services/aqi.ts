import { request } from "undici";
import { cfg } from "../config.js";
export async function getAqiPenalty(lat:number, lng:number) {
  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${cfg.waqiToken}`;
    const res = await request(url);
    const data = await res.body.json();
    const aqi = Number(data?.data?.aqi ?? 100);
    return aqi;
  } catch { return 100; }
}
