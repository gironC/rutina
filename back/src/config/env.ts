import dotenv from "dotenv";

dotenv.config();

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function positiveNumberEnvironmentVariable(
  name: string,
  defaultValue: number,
): number {
  const value = Number(process.env[name] ?? defaultValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number`);
  }

  return value;
}

export const env = {
  CORS_DOMAINS: (process.env.CORS_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean),
  JWT_SECRET: requiredEnvironmentVariable("JWT_SECRET"),
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES ?? "24h",
  REFRESH_TOKEN_DAYS: positiveNumberEnvironmentVariable(
    "REFRESH_TOKEN_DAYS",
    15,
  ),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  PORT: positiveNumberEnvironmentVariable("PORT", 4000),
  DB_HOST: process.env.DB_HOST ?? "localhost",
  DB_PORT: positiveNumberEnvironmentVariable("DB_PORT", 5432),
  DB_USER: requiredEnvironmentVariable("DB_USER"),
  DB_PASSWORD: requiredEnvironmentVariable("DB_PASSWORD"),
  DB_NAME: process.env.DB_NAME ?? "rutina",
};
