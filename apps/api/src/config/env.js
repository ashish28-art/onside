import "dotenv/config";

// Every environment variable the API needs lives here, in one place.
// If something is missing, we fail fast at startup instead of getting a
// confusing crash later when the code actually tries to use it.
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:3000",
  footballDataApiKey: required("FOOTBALL_DATA_API_KEY"),
  footballDataBaseUrl: process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4",
};
