import { UserDataClass, getUserData } from './../Gather'
import { GetMatches } from '../Combine'


import {
  setAccessToken,
  createSpotifyPlaylist

} from './../SpotifyConnector'
import { io } from '../server'

import {
  userIdExists,
  getUserById,
  deleteById
} from '../DataConnector'

import {
  AuxSyncRequest,
  UserResponse,
  UserData
} from '../Types'



function CreateCombinedPlaylist(userA: UserData, userB: UserData, access_token: string, res: UserResponse) {

  const { matched_artists, matched_tracks } = GetMatches(userA, userB)

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
    return CreateCombinedPlaylist(userA, userB, req.session.access_token, res)
  })
}