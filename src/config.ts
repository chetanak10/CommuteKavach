export const cfg = {
  port: Number(process.env.PORT ?? 8080),
  dbUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  mapsKey: process.env.MAPS_API_KEY!,
  owmKey: process.env.OWM_API_KEY!,
  waqiToken: process.env.WAQI_TOKEN!
};
