import { setAccessToken } from './SpotifyConnector'

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
export function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var text = ''

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}


export interface TrackTable {
  [artistId: string]: { [trackId: string]: boolean }
}


export interface ArtistFormat {
  id: string
}

export interface TrackFormat {
  uri: string
  artists: Array<ArtistFormat>
}

export function transformTracks(tracks: Array<TrackFormat>): TrackTable {
  // tracks are stored in a hash table
  // Note: there is no length attribute though.
  var trackTable: TrackTable = {}
  for (let i = 0; i < tracks.length; i++) {
    let artistUris = tracks[i].artists

    for (let j = 0; j < artistUris.length; j++) {
      let artistId = artistUris[j].id
      let trackId = tracks[i].uri

      if (trackTable[artistId] === undefined) { trackTable[artistId] = {} }

      trackTable[artistId][trackId] = true;
    }
  };
  return trackTable
}

export function mergeTracks(a: TrackTable, b: TrackTable): TrackTable {
  return Object.assign(a, b)
}

export function uniqueRandomIndices(needed: number, totalSize: number) {
  var values = [];

  // gets random unique values by using the property that the
  // likelihood of any element we are looking at as being selected as
  // the needed values divided by the total values
  for (let remaining = totalSize; remaining > 0; remaining--) {
    if (Math.random() < needed / remaining) {
      values.push(remaining - 1);
      needed--;
    }
  }
  return values;
}
