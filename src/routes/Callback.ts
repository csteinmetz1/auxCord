import { stateKey } from "./../App";
import { stringify } from "querystring";
import { redirect_uri, client_id, client_secret } from "../util/secrets";
import * as request from "request";
import { setAccessToken, getUserId, } from "../util/SpotifyConnector";

import { Request, Response } from "express";


export let callback = (req: Request, res: Response) => {
  // your application requests refresh and access tokens
  // after checking the state parameter


  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log("|" + state + "|" + storedState + "|");
  if (state === null || state !== storedState) {
    res.redirect("/#" + stringify({ error: "state_mismatch" }));
    return;
  }


  res.clearCookie(stateKey);


  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      "Authorization": "Basic " + (new Buffer(client_id + ":" + client_secret).toString("base64"))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      const access_token = body.access_token;
      const refresh_token = body.refresh_token;

      getUserId(access_token)
        .then((result) => {
          req.session.user_id = result.id;
          req.session.display_name = result.display_name;
          res.redirect("/menu.html");
        });

      req.session.access_token = access_token; // set cookie
      setAccessToken(access_token); // set library token
      console.log("Authenticated user.");

    } else {
      res.redirect("/#" +
        stringify({
          error: "invalid_token"
        }));
    }
  });
};
