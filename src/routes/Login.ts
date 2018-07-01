import { generateRandomString } from "../util/Tools";
import { stringify } from "querystring";
import { client_id, redirect_uri } from "../util/secrets";
import { stateKey } from "../App";
import { Request, Response } from "express";



export function login(req: Request, res: Response) {
  const state = generateRandomString(16);
  console.log(stateKey, state);
  res.cookie(stateKey, state);

  console.log(redirect_uri);

  // your application requests authorization
  const scope = "user-read-private user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public";
  res.redirect("https://accounts.spotify.com/authorize?" +
    stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
}
