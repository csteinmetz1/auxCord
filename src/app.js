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
var favicon = require('serve-favicon'); // let's use a favicon
var path = require('path');

/////////// MAKE SURE YOU HAVE THIS FILE /////////
var keys = require('./keys'); // Spotify API keys


// Set API keys for custom resquests
var client_id = keys.client_id;
var client_secret = keys.client_secret;
var redirect_uri = keys.redirect_uri;

// Set API keys for the library
var spotifyApi = new SpotifyWebApi({
  clientId: keys.client_id,
  clientSecret: keys.client_secret,
  redirectUri: keys.redirect_uri
});
////////////////////////////////////////////////////

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';
////////////////////// APP //////////////////////////
var app = express();
app.set('view engine', 'ejs'); // setup ejs templating

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(bodyparser.json());

app.use(express.static(__dirname + '/public'))
  .use(cookieParser());

// setup session cookie
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
// this is where the random string is used
//passed in for state which is used for 
app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {
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



function getNewAuxId() {
  let auxId = Math.floor(1000 + Math.random() * 9000);
  while (fs.existsSync('data/' + auxId + '.json')) {
    auxId = Math.floor(1000 + Math.random() * 9000);
  }

  console.log('Creating new aux', auxId);
  return auxId;
}


// I think we only care about the track uri, this will have to change otherwise
function transformTracks(tracks) {
  // tracks are stored in a hash table
  // Note: there is no length attribute though.
  var trackTable = {};
  for (let i = 0; i < tracks.length; i++) {
    let artistUris = tracks[i].artists

    for (let j = 0; j < artistUris.length; j++) {
      let artistId = artistUris[j].id;
      let trackId = tracks[i].uri;

      if (trackTable[artistId] === undefined) { trackTable[artistId] = {}; }

      trackTable[artistId][trackId] = true;
    }
  };
  return trackTable;
}

function mergeTracks(a, b) {
  return Object.assign(a, b);
}



function getUserData(req) {
  var userData = {
    userId: req.session.user_id,
    auxId: getNewAuxId(),
    display_name : req.session.display_name,
    tracks: []
  };

  let termQueries = [
    'short_term',
    'medium_term',
    'long_term'
  ];

  var results = {};
  var promises = [];

  for (let i = 0; i < termQueries.length; i++) {
    var term = termQueries[i];
    promises.push(
      getUsersTopTracks(req.session.access_token, term).then(
	function (result) {
	  results[term] = transformTracks(result);
	}
      )
    );
  }


  promises.push(
    getUsersPlaylists(req.session.access_token, userData.userId)
      .then(
	function (result) {

    var playlists = result.items.filter(function(playlist) {
      if (playlist.name === "auxCord") {
        console.log('Found pre-exisitng auxCord playlist.');
        return false;
      }
      else {
        return true;
      }
    })

	  return Promise.all(playlists.map(function (playlist) {
        return getUsersPlaylistTracks(req.session.access_token, playlist.owner.id, playlist.id);
	  }));
	}
      )
      .then(
	function (result) {
	  results['users_playlist_tracks'] = transformTracks(
	    result.reduce(function (accumulator, playlist) {
	      accumulator = accumulator.concat(playlist.items.map(function (item) {
		return item.track;
	      }));
	      return accumulator;
	    }, [])
	  );
	}
      )
  );


  return Promise.all(promises).then(function () {
    userData.tracks = {};
    for (let type in results) {
      userData.tracks = mergeTracks(userData.tracks, results[type]);
    }

    userData.totalTracks = 0;
    for (let artist in userData.tracks) {
      userData.totalTracks += Object.keys(userData.tracks[artist]).length
    }

    userData.totalArtists = Object.keys(userData.tracks).length;
    return userData;
  });
}


app.get('/create', function (req, res) {
  spotifyApi.setAccessToken(req.session.access_token);
  getUserData(req).then(
    function (userData) {

      res.render('create.ejs', { auxId: userData.auxId });

      // init socket.io
      io.on('connection', function (socket) {
        userData.socketId = socket.id;

        var data = JSON.stringify(userData);
        fs.writeFile('data/' + userData.auxId + '.json', data, 'utf8', function (err) {
            if (err) throw err;
        });
      });
    });
});

app.get('/join', function (req, res) {
  res.redirect('/join.html');
});


function uniqueRandomIndices(needed, totalSize) {
  var values = [];

  // gets random unique values by using the property that the
  // likelihood of any element we are looking at as being selected as
  // the needed values divided by the total values
  for (let remaining = totalSize; remaining > 0; remaining--) {
    if (Math.random() < needed / remaining) {
      values.push(remaining - 1);
      needed--;
    }
  }
  return values;
}


function createSpotifyPlaylist(user, userA ,access_token,  tracks, maxEntries) {
  return spotifyApi.createPlaylist(user.userId, 'auxCord', { 'public': true ,
  "description": "Synced with " + user.display_name + " and " + userA.display_name }).then(
    function(result) {
      var playlistId = result.body.id;
      user.newPlaylistId = playlistId; // adds property to object

      var sampledTracks = uniqueRandomIndices(maxEntries, tracks.length).map(function (randomIndex) {
	return tracks[randomIndex];
      });

      return spotifyApi.addTracksToPlaylist(user.userId, playlistId, sampledTracks).catch((err) => {
	console.log(err);
      });
    }
  );
}


app.post('/aux_sync', function (req, res) {
  var auxId = req.body.auxId;
  var filepath = 'data/' + auxId + '.json';
  if (fs.existsSync(filepath)) {
    // get user a data
    var userA = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    getUserData(req).then(function (userB) {

      spotifyApi.setAccessToken(req.session.access_token);
      userB.display_name = userB.display_name;

      var matched_tracks = [];
      var matched_artists = [];
      console.log("User A: ", userA.userId, userA.totalTracks, userA.totalArtists);
      console.log("User B: ", userB.userId, userB.totalTracks, userB.totalArtists);

      for (let artistId in userA.tracks) {
	if (userB.tracks[artistId] !== undefined) {
    matched_tracks = matched_tracks.concat(Object.keys(Object.assign(userA.tracks[artistId], userB.tracks[artistId])));
    matched_artists.push(artistId);
	}
      }
      console.log('creating playlist');
      return createSpotifyPlaylist(userB, userA, req.session.access_token, matched_tracks, 50)
	.then(function(){
          var trackMatches = matched_tracks.length;
          var artistMatches = matched_artists.length;
          var max_matches = Math.min(userA.totalArtists, userB.totalArtists);
          var per_match = Math.floor((artistMatches / max_matches)*100);

          console.log("created playlist");
	  console.log("Users are",  per_match, "% match.");


          io.to(userA.socketId)
	    .emit("done", {
	      playlistURL: "https://open.spotify.com/embed/user/"+ userB.userId + "/playlist/" + userB.newPlaylistId,
	      per_match : per_match
	    });

          res.render('done.ejs', {
	    playlistURL : "https://open.spotify.com/embed/user/" + userB.userId + "/playlist/" + userB.newPlaylistId,
	    per_match : per_match
	  });

          fs.unlink('data/' + auxId + '.json', function(err) {
	    if (err) throw err;
	    console.log('Deleted', 'data/' + auxId + '.json');
          });
	});
    });
  }
  else {
    res.redirect('/join.html');
    //io.on('connection', function (socket) {
    //  io.to(socket.id).emit("error", auxId + " is not a valid aux!");
    //  console.log('Invalid aux.')
    //});
  }
});

app.get('/refresh_token', function (req, res) {

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

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

///////////////////////////////////////////
//  Custom Methods
///////////////////////////////////////////
var getUserId = function (access_token) {
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function (resolve, reject) {
    request.get(options, function (error, response, body) {
      if (error) {
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  });
};

var getUsersTopTracks = function (access_token, term) {
  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function (resolve, reject) {
    request.get(options, function (error, response, body) {
      if (error) {
        reject(error);
      }
      else {
        resolve(body.items);
      }
    });
  });
};

var getUsersPlaylists = function (access_token, userId) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function (resolve, reject) {
    request.get(options, function (error, response, body) {
      if (error) {
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  });
};

var getUsersPlaylistTracks = function (access_token, userId, playlistId) {
  var options = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?fields=items(track)&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  return new Promise(function (resolve, reject) {
    request.get(options, function (error, response, body) {
      if (error) {
        reject(error);
      }
      else {
        resolve(body);
      }
    });
  });
};

////////////// Start server ////////////
var server = app.listen(8888, function () {
  console.log('auxCord listening on 8888');
});
var io = socket(server);
