export interface Session {
  user_id: string
  display_name: string
  access_token: string
}

export interface Query {
  code: string
  state: string
}


export interface UserRequest {
  session: Session
  query: Query
  cookies?: any
}
export interface UserResponse {
  redirect: (route: string) => void

  render: (
    filename: string,
    options: {
      playlistURL: string,
      per_match: number
    }
  ) => void

  clearCookie: (stateKey: string) => void

}


// AuxSync
export interface AuxSyncRequest extends UserRequest {
  body: { auxId: number }
}


export interface TrackTable {
  [artistId: string]: { [trackId: string]: boolean }
}


// User data
export interface UserData {
  userId: string
  auxId: number
  display_name: string
  tracks: TrackTable
  totalTracks: number
  totalArtists: number

  socketId?: string
}
