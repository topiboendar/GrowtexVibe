type Env = {
  APP_PORT: number;
  APP_HOST: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
};

function required(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function withDefault(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
}

function toNumber(key: string, value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, received: ${value}`);
  }
  return parsed;
}

export const env: Env = {
  APP_PORT: toNumber("APP_PORT", withDefault("APP_PORT", "3000")),
  APP_HOST: withDefault("APP_HOST", "0.0.0.0"),
  DB_HOST: withDefault("DB_HOST", "localhost"),
  DB_PORT: toNumber("DB_PORT", withDefault("DB_PORT", "3306")),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: withDefault("DB_PASSWORD", ""),
  DB_NAME: required("DB_NAME"),
};
