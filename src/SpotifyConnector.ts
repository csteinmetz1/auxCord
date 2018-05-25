import * as SpotifyWebApi from 'spotify-web-api-node'
import keys from './Keys'
import * as request from 'request'
import { getNewAuxId } from './Data'


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
////////////////////////////////////////////////////////////
export function getUserData(req) {
	var userData = {
		userId: req.session.user_id,
		auxId: getNewAuxId(),
		display_name: req.session.display_name,
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

					var playlists = result.items.filter(function (playlist) {
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
