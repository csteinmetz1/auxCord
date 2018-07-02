import { client_id, client_secret, redirect_uri } from "../util/secrets";
import * as request from "request";
import { Response } from "express";

import { UserModel } from "../models/User";


function Get(options: request.Options): Promise<any> {
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) reject(error);
      else resolve(body);
    });
  });
}

function Post(options: request.Options): Promise<any> {
  return new Promise((resolve, reject) => {
    request.post(options, (error, response, body) => {
      if (error) reject(error);
      else resolve(body);
    });
  });
}


interface UserIdResult extends Promise<{
  id: string,
  display_name: string
}> { }

////////////////////////////////////////////////////////////
export function getUserId(access_token: string): UserIdResult {
  return Get({
    url: "https://api.spotify.com/v1/me",
    headers: { "Authorization": "Bearer " + access_token },
    json: true
  });
}



interface TrackList {
  items: Array<any>;
}


////////////////////////////////////////////////////////////
export function getUsersTopTracks(access_token: string, term: string) {
  return Get({
    url: "https://api.spotify.com/v1/me/top/tracks?time_range=" + term + "&limit=50",
    headers: { "Authorization": "Bearer " + access_token },
    json: true
  }).then((res: TrackList) => {
    return res.items;
  });
}
////////////////////////////////////////////////////////////
export function getUsersPlaylists(access_token: string, userId: string) {
  return Get({
    url: "https://api.spotify.com/v1/users/" + userId + "/playlists?limit=50",
    headers: { "Authorization": "Bearer " + access_token },
    json: true
  });
}

////////////////////////////////////////////////////////////
export function getUsersPlaylistTracks(access_token: string, userId: string, playlistId: string) {
  return Get({
    url: "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks?fields=items(track)&limit=50",
    headers: { "Authorization": "Bearer " + access_token },
    json: true
  });
}

function createPlaylist(access_token: string, user_id: string, name: string, description: string) {
  return Post({
    url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
    headers: {
      "Authorization": "Bearer " + access_token,
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      name,
      description
    }
  });
}


function addToPlaylist(access_token: string, user_id: string, playlist_id: string, uris: Array<string>) {
  return Post({
    url: "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/tracks",
    headers: {
      "Authorization": "Bearer " + access_token,
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      uris
    }
  });
}



////////////////////////////////////////////////////////////
// makes spotify playlist under userB
export function createSpotifyPlaylist(userB: UserModel, userA: UserModel, access_token: string, tracks: Array<string>) {
  // console.log("trying with...");
  // console.log(userB);
  return createPlaylist(
    access_token,
    userB.userId,
    "auxCord",
    "Synced with " + userB.display_name + " and " + userA.display_name
  ).then((res: any) => {
    const playlistId = res.id;

    return addToPlaylist(access_token, userB.userId, playlistId, tracks)
      .then(() => (
        playlistId
      )).catch((err: any) => {
        console.error("Error occured trying to add to playlist");
        console.error(err);
      });
  }).catch((err: any) => {
    console.error("Failed to create playlist");
    console.error(err);
  });
}
