import { UserDataClass, getUserData } from './../Gather'
import {
  setAccessToken,
  createSpotifyPlaylist

} from './../SpotifyConnector'
import { io } from '../server'

import {
  userIdExists,
  getUserById,
  deleteById
} from '../Data'

import {
  AuxSyncRequest,
  UserResponse,
  UserData
} from '../Types'



function GenerateCommonPlaylist(userA: UserData, userB: UserData, access_token: string, res: UserResponse) {
  var matched_tracks: Array<string> = [];
  var matched_artists: Array<string> = [];

  console.log("User A: ", userA.userId, userA.totalTracks, userA.totalArtists);
  console.log("User B: ", userB.userId, userB.totalTracks, userB.totalArtists);

  for (let artistId in userA.tracks) {
    if (userB.tracks[artistId] !== undefined) {

      matched_tracks = matched_tracks.concat(
        Object.keys(
          Object.assign(
            userA.tracks[artistId],
            userB.tracks[artistId]
          )
        )
      )
      matched_artists.push(artistId);
    }
  }


  console.log('creating playlist')

  return createSpotifyPlaylist(userB, userA, access_token, matched_tracks, 50)
    .then((newPlaylistId: number) => {

      var trackMatches = matched_tracks.length
      var artistMatches = matched_artists.length;
      var max_matches = Math.min(userA.totalArtists, userB.totalArtists);
      var per_match = Math.floor((artistMatches / max_matches) * 100);

      console.log("created playlist");
      console.log("Users are", per_match, "% match.");

      if (userA.socketId === undefined) throw new Error('no socket id for user a')
      else {
        io.to(userA.socketId)
          .emit("done", {
            playlistURL: "https://open.spotify.com/embed/user/" +
              userB.userId + "/playlist/" + newPlaylistId,
            per_match: per_match
          });
      }



      res.render('done.ejs', {
        playlistURL: "https://open.spotify.com/embed/user/" + userB.userId +
          "/playlist/" + newPlaylistId,
        per_match: per_match
      });



      deleteById(userA.auxId)
    });
}



export function auxsync(req: AuxSyncRequest, res: UserResponse) {
  var auxId = req.body.auxId;

  if (!userIdExists(auxId)) {
    res.redirect('/join.html')
    return
  }

  // get user a data
  var userA: UserData = getUserById(auxId)

  return getUserData(req).then((userB) => {
    setAccessToken(req.session.access_token)
    return GenerateCommonPlaylist(userA, userB, req.session.access_token, res)
  })
}