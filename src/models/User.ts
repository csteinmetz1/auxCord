import mongoose from "mongoose";
import TrackTable from "./TrackTable";
import { getAuxId, putAuxId } from "./AuxId";

mongoose.Promise = require("bluebird");




// User data
export interface UserModelDocument extends mongoose.Document, UserModel {
  // export type UserModel =n mongoose.Document & {
}


// schema base of things that are not always required by random functions
interface UserSchemaTypeBase {
  userId: string;
  auxId: string;
  display_name: string;

  artistMap?: { [artist: string]: Array<string> };
  totalTracks?: number;
  totalArtists?: number;
  socketId?: string;
}

// add these types required
interface UserSchemaType extends UserSchemaTypeBase {
  artistMap: { [artist: string]: Array<string> };
  totalTracks: number;
  totalArtists: number;
  socketId: string;
}

const UserModelName = "User";

// this should match the user model except for the track table.
const userSchema = new mongoose.Schema({
  userId: String,
  auxId: { type: String, index: true },

  display_name: String,
  artistMap: Object, /* {
    type: Map,
    of: {
      type: Map,
      of: Boolean
    }
  },*/
  totalTracks: Number,
  totalArtists: Number,
  socketId: String,

  createdAt: { type: Date, expires: 60 * 60 * 24 * 1 /* 1 day */, default: Date.now },
}, { timestamps: true });

// must use function in places like this, because () => {} explicitly disallows binding
userSchema.pre("remove", function(next) {
  putAuxId(this.auxId);
  next();
});


const User = mongoose.model(UserModelName, userSchema);


export let getUserByAuxId = (auxId: string) => (
  User.findOne().where({ auxId }).exec().then((user: UserModelDocument | null) => (
    user === null ? null : new UserModel(user)
  ))
);


export let deleteUserByAuxId = (auxId: string) => (
  User.findOneAndRemove().where({ auxId })
);


export default User;


const saveUserModel = (user: UserSchemaType) => (
  (new User(user)).save()
);



export class UserModel {
  userId: string;
  auxId: string;
  display_name: string;
  tracks: TrackTable;
  totalTracks: number;
  totalArtists: number;
  socketId?: string;

  constructor(params: UserSchemaTypeBase) {
    this.userId = params.userId;
    this.auxId = params.auxId;
    this.display_name = params.display_name;

    if (params.socketId === undefined) this.socketId = null;
    else this.socketId = params.socketId;


    this.tracks = new TrackTable({ artistMap: params.artistMap });
    this.totalTracks = params.totalTracks || 0;
    this.totalArtists = params.totalArtists || 0;
  }


  // package our object and save it to database
  saveToDatabase = () => {
    const artistMap: { [artist: string]: Array<string> } = {};

    this.tracks.getData().forEach((tracks, artist) => {
      artistMap[artist] = [];
      tracks.forEach((track) => { artistMap[artist].push(track); });
    });


    return saveUserModel({
      userId: this.userId,
      auxId: this.auxId,
      display_name: this.display_name,
      artistMap: artistMap,
      totalArtists: this.totalArtists,
      totalTracks: this.totalTracks,
      socketId: this.socketId
    });
  }
}
