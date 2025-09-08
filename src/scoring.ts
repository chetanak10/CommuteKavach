export function weatherPenalty({ rain, feelsLike }: { rain: boolean; feelsLike: number }) {
  let p = 0;
  if (rain) p += 12;
  if (feelsLike >= 35) p += 10;
  else if (feelsLike >= 30) p += 5;
  return p;
}
export function aqiPenalty(aqi: number) {
  if (aqi <= 100) return 0;
  if (aqi <= 150) return 10;
  if (aqi <= 200) return 20;
  if (aqi <= 300) return 35;
  return 45;
}
export function finalScore(etaMin: number, w: number, a: number) {
  const s = 100 - 0.8 * etaMin - w - a;
  return Math.max(0, Math.min(100, Math.round(s)));
}
