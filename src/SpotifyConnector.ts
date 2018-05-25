import SpotifyWebApi from 'spotify-web-api-node'
import keys from './Keys'
import request from 'request'
import { uniqueRandomIndices } from './Tools'
import {
  UserData,
  UserResponse,
} from './Types'


var spotifyApi = new SpotifyWebApi(keys);




function Get(options: request.Options): Promise<any> {
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) reject(error)
      else resolve(body)
    })
  })
}


////////////////////////////////////////////////////////////
export function setAccessToken(access_token: string) {
  spotifyApi.setAccessToken(access_token)
}


interface UserIdResult extends Promise<{
  id: number,
  display_name: string
}> { }

////////////////////////////////////////////////////////////
export function getUserId(access_token: string): UserIdResult {
  return Get({
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  })
}


interface TrackList {
  items: Array<any>
}


////////////////////////////////////////////////////////////
export function getUsersTopTracks(access_token: string, term: string) {
  return Get({
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }).then((res: TrackList) => res.items)
}
////////////////////////////////////////////////////////////
export function getUsersPlaylists(access_token: string, userId: string) {
  return Get({
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  })
}

////////////////////////////////////////////////////////////
export function getUsersPlaylistTracks(access_token: string, userId: string, playlistId: string) {
  return Get({
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?fields=items(track)&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  })
}

////////////////////////////////////////////////////////////
// makes spotify playlist under userB
export function createSpotifyPlaylist(userB: UserData, userA: UserData, access_token: string, tracks: Array<string>, maxEntries: number) {
  return spotifyApi.createPlaylist(userB.userId, 'auxCord', {
    'public': true,
    "description": "Synced with " + userB.display_name + " and " + userA.display_name
  }).then(
    function (result: { body: { id: string } }) {
      var playlistId = result.body.id;

      var sampledTracks = uniqueRandomIndices(maxEntries, tracks.length).map(function (randomIndex) {
        return tracks[randomIndex];
      });

      return spotifyApi.addTracksToPlaylist(userB.userId, playlistId, sampledTracks).then(() => (
        playlistId
      )).catch((err: any) => {
        console.log(err);
      });
    }
  );
}