import keys from '../Keys'
import request from 'request'

import {
  UserRequest,
  UserResponse
} from '../Types'


export function refresh_token(req: UserRequest, res: UserResponse) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' +
        (new Buffer(keys.clientId + ':' + keys.clientSecret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token
      })
    }
  })
}
