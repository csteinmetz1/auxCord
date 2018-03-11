/**
 * auxCord
 * CUhackit 2018
 * March 10, 2018
 */

// core backend framework
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var session = require('client-sessions'); // store user data in cookies
var fs = require('fs'); // filesystem
var SpotifyWebApi = require('spotify-web-api-node'); // library for spotify endpoints
var socket = require('socket.io'); // sockect connection to clients
var bodyparser = require('body-parser'); // parse those bodies
var async = require('async'); // async methods

/////////// MAKE SURE YOU HAVE THIS FILE /////////
var keys = require('./keys'); // Spotify API keys

// Set API keys for custom resquests
var client_id = keys.client_id;
var client_secret = keys.client_secret;
var redirect_uri = keys.redirect_uri;

// Set API keys for the library
var spotifyApi = new SpotifyWebApi({
  clientId : keys.client_id,
  clientSecret : keys.client_id,
  redirectUri : keys.client_id
});
////////////////////////////////////////////////////

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.set('view engine', 'ejs'); // setup ejs templating

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

// setup session cookie
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-top-read playlist-read-private playlist-read-collaborative';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        getUserId(access_token)
        .then(function(result){
          req.session.user_id = result;
          res.redirect('/menu.html')
        });

        req.session.access_token = access_token; // set cookie
        spotifyApi.setAccessToken(access_token); // set library token
        console.log("Authenticated user.");

      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/create', function(req, res) {

  var auxId = Math.floor(1000 + Math.random()*9000)
  console.log('Creating new aux', auxId);

  var user_a_data = {};
  user_a_data.auxId = auxId;
  user_a_data.userId = req.session.user_id;
  getUsersTopTracks(req.session.access_token, 'short_term')
  .then(function(result){
    user_a_data.tracks = result;
    return getUsersTopTracks(req.session.access_token, 'medium_term');
  })
  .then(function(result){
    user_a_data.tracks = user_a_data.tracks.concat(result);
    return getUsersTopTracks(req.session.access_token, 'long_term');
  })
  .then(function(result){
    user_a_data.tracks = user_a_data.tracks.concat(result)
  });

  getUsersPlaylists(req.session.access_token, user_a_data.userId)
  .then(function(result){
    var promises = result.items.map(function(playlist){
      //console.log(playlist.id)
      return getUsersPlaylistTracks(req.session.access_token, user_a_data.userId, playlist.id);
    })
    return Promise.all(promises);
  })
  .then(function(result){
    result.reduce(function (accumulator, playlist) {
      return accumulator + playlist.items;
    },
    user_a_data.tracks
   );
    //console.log('Found', user_a_data.length, 'tracks...');
    var data = JSON.stringify(user_a_data);
    fs.writeFile('data/' + auxId + '.json', data, 'utf8'
    ,function(err){
      if (err) throw err
    });
    res.render('create.ejs', {auxId : auxId});
  });
});

app.get('/join', function(req, res) {
  res.redirect('/join.html');
});

app.post('/aux_sync', function(req, res) {

});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// Handle 404
 app.use(function(req, res) {
		res.send('404: Page not Found', 404);
 });

 // Handle 500
 app.use(function(error, req, res, next) {
		res.send('500: Internal Server Error', 500);
 });

///////////////////////////////////////////
//  Custom Methods
///////////////////////////////////////////
var getUserId = function(access_token) {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function(resolve, reject){
    request.get(options, function(error, response, body) {
      if (error){
        reject(error);
      }
      else {
        resolve(body.id);
      }
    });
  })
}

var getUsersTopTracks = function(access_token, term) {
  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function(resolve, reject){
    request.get(options, function(error, response, body) {
      if (error){
        reject(error);
      }
      else {
        resolve(body.items);
      }
    });
  })
}

var getUsersPlaylists = function(access_token, userId) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function(resolve, reject){
    request.get(options, function(error, response, body) {
      if (error){
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  })
}

var getUsersPlaylistTracks = function(access_token, userId, playlistId) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?fields=items(track)&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function(resolve, reject){
    request.get(options, function(error, response, body) {
      if (error){
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  })
}

////////////// Start server ////////////
console.log('auxCord listening on 8888');
app.listen(8888);
