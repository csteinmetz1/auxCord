import * as SpotifyWebApi from 'spotify-web-api-node'
import keys from './Keys'
import * as request from 'request'


var spotifyApi = new SpotifyWebApi(keys);




function Get(options: request.Options) {
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

////////////////////////////////////////////////////////////
export function getUserId(access_token) {
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
export function getUsersTopTracks(access_token, term) {
  return Get({
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=' + term + '&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }).then((res: TrackList) => res.items)
}
////////////////////////////////////////////////////////////
export function getUsersPlaylists(access_token, userId) {
  return Get({
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  })
}

////////////////////////////////////////////////////////////
export function getUsersPlaylistTracks(access_token, userId, playlistId) {
  return Get({
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId + '/tracks?fields=items(track)&limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  })
}
