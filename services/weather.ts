import { request } from "undici";
import { cfg } from "../config.js";
export async function getWeatherPenalty(lat:number, lng:number) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${cfg.owmKey}&units=metric`;
    const res = await request(url);
    const w = await res.body.json();
    const rain = !!(w.rain?.["1h"]) || (w.weather?.[0]?.description ?? "").toLowerCase().includes("rain");
    const feelsLike = w.main?.feels_like ?? 30;
    return { rain, feelsLike };
  } catch { return { rain:false, feelsLike:30 }; }
}
