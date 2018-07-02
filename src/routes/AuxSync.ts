import { addUsersTracks } from "../util/Gather";
import { GetMatches } from "../util/Combine";


import {
  createSpotifyPlaylist
} from "../util/SpotifyConnector";
import { io } from "../Server";


import User, { UserModel, deleteUserByAuxId, getUserByAuxId, UserModelDocument } from "../models/User";
import { Request, Response } from "express";

function CreateCombinedPlaylist(userA: UserModel, userB: UserModel, access_token: string, req: Request, res: Response) {

  const { matches, percent_match } = GetMatches(userA, userB, 50);

  console.log("creating playlist");

  return createSpotifyPlaylist(userB, userA, access_token, matches)
    .then((newPlaylistId: string) => {

      console.log("created playlist");
      console.log("Users are", percent_match, "% match.");
      console.log("Total matches: ", matches.length);

      if (userA.socketId === undefined) throw new Error("no socket id for user a");
      else {
        io.to(userA.socketId)
          .emit("done", {
            playlistURL: "https://open.spotify.com/embed/user/" +
              userB.userId + "/playlist/" + newPlaylistId,
            per_match: percent_match
          });
      }



      res.render("done.ejs", {
        playlistURL: "https://open.spotify.com/embed/user/" + userB.userId +
          "/playlist/" + newPlaylistId,
        per_match: percent_match
      });

      // do we want to do this still if they expire?
      deleteUserByAuxId(userA.auxId);
    });
}



export let auxsync = (req: Request, res: Response) => {
  const auxId = req.body.auxId;
  console.log(`attempt to sync with ${auxId}`);
  getUserByAuxId(auxId).then((userA: UserModelDocument | null) => {
    if (userA === null) {
      res.redirect("/join.html");
      return;
    }
    // do not save this model to the database, or the auxId will expire
    return addUsersTracks(
      new UserModel({
        userId: req.session.user_id,
        auxId: userA.auxId,
        display_name: req.session.display_name
      }),
      req
    ).then((userB) => {
      return CreateCombinedPlaylist(userA, userB, req.session.access_token, req, res);
    });
  });
};
