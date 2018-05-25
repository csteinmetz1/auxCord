import {
  AuxSyncRequest,
  UserResponse,
  UserData
} from './Types'

export function GetMatches(userA: UserData, userB: UserData) {
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

  return {
    matched_tracks,
    matched_artists
  }
}