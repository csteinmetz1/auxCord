

export function auxsync(req, res) {
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
        .then(function () {
          var trackMatches = matched_tracks.length;
          var artistMatches = matched_artists.length;
          var max_matches = Math.min(userA.totalArtists, userB.totalArtists);
          var per_match = Math.floor((artistMatches / max_matches) * 100);

          console.log("created playlist");
          console.log("Users are", per_match, "% match.");


          io.to(userA.socketId)
            .emit("done", {
              playlistURL: "https://open.spotify.com/embed/user/" + userB.userId + "/playlist/" + userB.newPlaylistId,
              per_match: per_match
            });

          res.render('done.ejs', {
            playlistURL: "https://open.spotify.com/embed/user/" + userB.userId + "/playlist/" + userB.newPlaylistId,
            per_match: per_match
          });

          fs.unlink('data/' + auxId + '.json', function (err) {
            if (err) throw err;
            console.log('Deleted', 'data/' + auxId + '.json');
          });
        });
    });
  }