import { getNewAuxId } from './Data'
import {
	getUsersPlaylists,
	getUsersTopTracks,
	getUsersPlaylistTracks
} from './SpotifyConnector'
import {
	transformTracks,
	mergeTracks
} from './tools'


export function getUserData(req) {
	var userData = {
		userId: req.session.user_id,
		auxId: getNewAuxId(),
		display_name: req.session.display_name,
		tracks: {},
		totalTracks: 0,
		totalArtists: 0
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
				function (result: { items: Array<any> }) {

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
						result.reduce(function (accumulator: Array<any>, playlist: { items: Array<any> }) {
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