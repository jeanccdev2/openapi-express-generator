import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // Asaas
  ASAAS_BASE_URL: process.env.ASAAS_BASE_URL || "https://api-sandbox.asaas.com",
  ASAAS_API_KEY: process.env.ASAAS_API_KEY || "",

  // Webhook
  WEBHOOK_URL: process.env.WEBHOOK_URL || "",
};
