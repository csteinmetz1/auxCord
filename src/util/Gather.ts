import {
  getUsersPlaylists,
  getUsersTopTracks,
  getUsersPlaylistTracks
} from "./SpotifyConnector";

import TrackTable, { TrackFormat, ArtistFormat } from "../models/TrackTable";


import { UserModel } from "../models/User";

import { Request, Response } from "express";



interface TrackPromises extends Array<Promise<TrackTable>> { }

// adds track promises for top track queries
function DoTopTrackQueries(access_token: string, promises: TrackPromises) {
  ["short_term", "medium_term", "long_term"].forEach((term) => {
    promises.push(
      getUsersTopTracks(access_token, term).then((tracks: Array<TrackFormat>) => {
        return new TrackTable({ tracks });
      })
    );
  });

  return promises;
}


// adds track promises for playlist queries
function DoPlaylistQueries(userId: string, access_token: string, promises: TrackPromises) {

  interface Owner {
    id: string;
  }

  interface Track {
    track: string;

  }

  interface Playlist {
    id: string;
    name: string;
    owner: Owner;
    items?: Array<Track>;
  }

  interface Playlists {
    items: Array<Playlist>;
  }

  promises.push(
    getUsersPlaylists(access_token, userId)
      .then((res: Playlists) => {

        const playlists = res.items.filter((playlist) => (playlist.name !== "auxCord"));

        return Promise.all(playlists.map((playlist) => (
          getUsersPlaylistTracks(access_token, playlist.owner.id, playlist.id)
        )));
      })
      .then((res) => (
        new TrackTable({
          tracks: res.reduce((accumulator: Array<any>, playlist: Playlist) => (

            accumulator.concat(playlist.items.map((item) => (
              item.track
            )))

          ), [])
        })
      ))
  );
}


// returns your passed in user model for convenience
export function addUsersTracks(user: UserModel, req: Request): Promise<UserModel> {
  const { access_token, user_id } = req.session;

  const promises: TrackPromises = [];

  DoTopTrackQueries(access_token, promises);
  DoPlaylistQueries(user_id, access_token, promises);

  return Promise.all(promises).then((results: Array<TrackTable>) => {

    results.forEach((tt: TrackTable) => {
      user.tracks.merge(tt);
    });

    user.totalTracks = 0;
    user.tracks.getData().forEach((tracks, artist) => {
      user.totalTracks += tracks.size;
    });

    user.totalArtists = user.tracks.getData().size;

    // console.log("user artists: " + user.totalArtists);
    // console.log("user tracks: " + user.totalTracks);
    return user;
  });
}
