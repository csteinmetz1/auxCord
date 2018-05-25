import * as SpotifyWebApi from 'spotify-web-api-node'
import keys from './Keys'


var spotifyApi = new SpotifyWebApi(keys);


export function setAccessToken(access_token: string) {
    spotifyApi.setAccessToken(access_token)
}
