import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.error("'.env' file does not exist. Make file based on '.env.example'");
  process.exit(1);
}

export const environment = process.env.NODE_ENV;
const prod = environment === "production"; // Anything else is treated as 'dev'

export const session_secret = process.env["SESSION_SECRET"];
export const mongodb_uri = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

export const client_id = process.env["CLIENT_ID"];
export const client_secret = process.env["CLIENT_SECRET"];
export const redirect_uri = process.env["REDIRECT_URI"];

let missingValue = false;
if (!session_secret) {
  logger.error("No client secret. Set SESSION_SECRET environment variable.");
  missingValue = true;
}

if (!mongodb_uri) {
  logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
  missingValue = true;
}

if (!client_id) {
  logger.error("No spotify client id. Set CLIENT_ID environment variable.");
  missingValue = true;
}

if (!client_secret) {
  logger.error("No spotify client secret. Set CLIENT_SECRET environment variable.");
  missingValue = true;
}

if (!redirect_uri) {
  logger.error("No spotify redirect uri. Set REDIRECT_URI environment variable.");
  missingValue = true;
}

if (missingValue) {
  process.exit(1);
}