import { stateKey } from './../server'
import { stringify } from 'querystring'
import keys from './../Keys'
import * as request from 'request'
import {
  setAccessToken,
  getUserId
} from './../SpotifyConnector'


export function callback(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' + stringify({ error: 'state_mismatch' }))
    return
  }


  res.clearCookie(stateKey);


  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: keys.redirectUri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(keys.clientId + ':' + keys.clientSecret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {

      var access_token = body.access_token,
        refresh_token = body.refresh_token;

      getUserId(access_token)
        .then(function (result) {
          req.session.user_id = result.id;
          req.session.display_name = result.display_name;
          res.redirect('/menu.html')
        });

      req.session.access_token = access_token; // set cookie
      setAccessToken(access_token); // set library token
      console.log("Authenticated user.");

    } else {
      res.redirect('/#' +
        stringify({
          error: 'invalid_token'
        }));
    }
  });
}