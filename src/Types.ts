export interface Session {
  user_id: number
  display_name: string
  access_token: string
}

export interface UserRequest {
  session: Session
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
}


// AuxSync
export interface AuxSyncRequest extends UserRequest {
  body: { auxId: number }
}



// User data
export interface UserData {
  userId: number
  auxId: number
  display_name: string
  tracks: { [artistId: string]: { [trackId: string]: string } }
  totalTracks: number
  totalArtists: number

  socketId?: string
}