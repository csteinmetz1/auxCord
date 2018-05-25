import { getNewAuxId } from './Data'
import {
  getUsersPlaylists,
  getUsersTopTracks,
  getUsersPlaylistTracks
} from './SpotifyConnector'
import {
  TrackTable,
  transformTracks,
  mergeTracks
} from './tools'



export interface Session {
  user_id: number
  display_name: string
  access_token: string
}

interface UserDataRequest {
  session: Session
}


export class UserData {
  userId: number
  auxId: number
  display_name: string
  tracks: {}
  totalTracks: number
  totalArtists: number

  socketId?: number

  constructor(req: UserDataRequest) {
    this.userId = req.session.user_id
    this.auxId = getNewAuxId()

    this.display_name = req.session.display_name

    this.tracks = {}

    this.totalTracks = 0
    this.totalArtists = 0
  }
}



interface TrackPromises extends Array<Promise<TrackTable>> { }

// adds track promises for top track queries
function DoTopTrackQueries(access_token: string, promises: TrackPromises) {
  const terms = [
    'short_term',
    'medium_term',
    'long_term'
  ]

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i]
    promises.push(
      getUsersTopTracks(access_token, term).then(transformTracks)
    )
  }

  return promises
}


// adds track promises for playlist queries
function DoPlaylistQueries(userId: number, access_token: string, promises: TrackPromises) {

  interface Owner {
    id: number
  }

  interface Track {
    track: string

  }

  interface Playlist {
    id: number
    name: string
    owner: Owner
    items?: Array<Track>
  }

  interface Playlists {
    items: Array<Playlist>
  }

  promises.push(
    getUsersPlaylists(access_token, userId)
      .then((res: Playlists) => {

        var playlists = res.items.filter((playlist) => (playlist.name !== "auxCord"))

        return Promise.all(playlists.map((playlist) => (
          getUsersPlaylistTracks(access_token, playlist.owner.id, playlist.id)
        )))
      })
      .then((res) => (
        transformTracks(res.reduce((accumulator: Array<any>, playlist: Playlist) => (
          accumulator.concat(playlist.items.map((item) => (
            item.track
          )))
        ), []))
      ))
  )
}


export function getUserData(req: UserDataRequest): Promise<UserData> {
  const { access_token, user_id } = req.session

  var user = new UserData(req)

  var promises: TrackPromises = []

  DoTopTrackQueries(access_token, promises)
  DoPlaylistQueries(user_id, access_token, promises)


  return Promise.all(promises).then((results: Array<TrackTable>) => {
    results.forEach((tt: TrackTable) => {
      user.tracks = mergeTracks(user.tracks, tt)
    })

    user.totalTracks = 0
    for (let artist in user.tracks) {
      user.totalTracks += Object.keys(user.tracks[artist]).length
    }

    user.totalArtists = Object.keys(user.tracks).length

    return user;
  })
}
