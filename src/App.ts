import express from "express";
import compression from "compression";  // compresses requests
import socket from "socket.io";
import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";

import expressValidator from "express-validator";
import bluebird from "bluebird";
import { mongodb_uri, session_secret } from "./util/secrets";

import cookieParser from "cookie-parser";

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import { auxsync } from "./routes/AuxSync";
import { callback } from "./routes/Callback";
import { create } from "./routes/Create";
import { join } from "./routes/Join";
import { login } from "./routes/Login";
import { refresh_token } from "./routes/RefreshToken";


// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = mongodb_uri;

// Change promises to bluebird promises
(<any>mongoose).Promise = bluebird;

mongoose.connect(mongoUrl).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 8888)
  .set("views", path.join(__dirname, "../views"))
  .set("view engine", "ejs")
  .use(compression())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(expressValidator())
  .use(cookieParser());

// session and mongo connection
app.use(session({
  //  cookieName: "session",
  resave: true,
  saveUninitialized: true,
  secret: session_secret,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));

// disallow cross origin requests
// app.use(lusca.xframe("SAMEORIGIN"));
// app.use(lusca.xssProtection(true));

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


// statekey
const stateKey = "spotify_auth_state";
export { stateKey };


/**
 * Primary app routes.
 */

app.get("/login", login);
app.get("/callback", callback);
app.get("/create", create);
app.get("/join", join);
app.get("/refresh_token", refresh_token);
app.post("/aux_sync", auxsync);

export default app;
