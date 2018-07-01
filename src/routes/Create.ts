import { setAccessToken } from "../util/SpotifyConnector";
import { addUsersTracks } from "../util/Gather";
import { io } from "../Server";
import { writeFile } from "fs";

import { Request, Response } from "express";


import { UserModel } from "../models/User";
import { getAuxId } from "../models/AuxId";


export function create(req: Request, res: Response) {
  setAccessToken(req.session.access_token);

  getAuxId().then((auxId) => {
    if (auxId !== "0" && !auxId) {
      console.error(`AuxId was returned as ${auxId}`);
    }
    return addUsersTracks(
      new UserModel({
        userId: req.session.id,
        auxId: auxId,
        display_name: req.session.display_name
      }),
      req
    );
  }).then((user) => {

    res.render("create.ejs", { auxId: user.auxId });

    io.on("connection", (socket) => {
      user.socketId = socket.id;
      console.log("saving user to database");
      user.saveToDatabase();
    });
  });
}
