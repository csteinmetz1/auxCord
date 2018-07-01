import { client_id, client_secret } from "../util/secrets";
import * as request from "request";
import { Request, Response } from "express";


export function refresh_token(req: Request, res: Response) {
  // requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "Authorization": "Basic " +
        (new Buffer(client_id + ":" + client_secret).toString("base64"))
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const { access_token } = body;
      res.send({ access_token });
    }
  });
}
