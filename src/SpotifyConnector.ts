import * as SpotifyWebApi from 'spotify-web-api-node'
import keys from './Keys'
import * as request from 'request'



var spotifyApi = new SpotifyWebApi(keys);

////////////////////////////////////////////////////////////
export function setAccessToken(access_token: string) {
	spotifyApi.setAccessToken(access_token)
}
////////////////////////////////////////////////////////////
export function getUserId(access_token) {
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
}
////////////////////////////////////////////////////////////
export function getUsersTopTracks(access_token, term) {
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
}
////////////////////////////////////////////////////////////
export function getUsersPlaylists(access_token, userId) {
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
}

////////////////////////////////////////////////////////////
export function getUsersPlaylistTracks(access_token, userId, playlistId) {
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
}
