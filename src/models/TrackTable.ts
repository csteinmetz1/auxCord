/**
 * Contains track information and handles merging of tracks
 */


export interface ArtistFormat {
  id: string;
}

export interface TrackFormat {
  uri: string;
  artists: Array<ArtistFormat>;
}


export interface ArtistMap extends Map<string, Set<string>> { }

export interface IntersectKeys {
  artist: string;
  a: Set<string>;
  b: Set<string>;
}

export default class TrackTable {
  private artists: ArtistMap;

  // get data map object for storage in database
  public getData = () => { return this.artists; };


  public artistTotal = () => { return this.artists.size; };
  public trackTotal = () => {
    let total = 0;
    this.artists.forEach((trackList) => {
      total += trackList.size;
    });
    return total;
  };

  // insert artist and track into table
  public insert = (artist: string, track: string) => {
    if (this.artists.get(artist) === undefined) {
      this.artists.set(artist, new Set());
    }

    this.artists.get(artist).add(track);
  }

  // merge with another track table
  public merge = (other: TrackTable) => {
    other.artists.forEach((tracks, artist) => {
      if (this.artists.get(artist) === undefined) {
        this.artists.set(artist, new Set());
      }

      tracks.forEach((track) => {
        this.artists.get(artist).add(track);
      });
    });
  }

  // returns new TrackTable with the elements that are in common between
  // two tracktables
  public getIntersect = (other: TrackTable) => {
    const tt: TrackTable = new TrackTable();
    this.artists.forEach((tracks, artist) => {
      if (other.artists.get(artist) !== undefined) {
        tt.artists.set(
          artist,
          new Set([...tracks, ...other.artists.get(artist)])
        );
      }
    });
    return tt;
  }

  // returns list of keys in common
  public getIntersectKeys = (other: TrackTable) => {
    const keys: Array<IntersectKeys> = [];
    this.artists.forEach((tracks, artist) => {
      if (other.artists.get(artist) !== undefined) {
        keys.push({
          artist: artist,
          a: this.artists.get(artist),
          b: other.artists.get(artist)
        });
      }
    });

    return keys;
  }

  // converts track format given from spotify
  private transformTracks = (tracks: Array<TrackFormat>) => {
    tracks.forEach((trackFormat) => {
      const artistUris = trackFormat.artists;

      artistUris.forEach((artistUri) => {
        const artist = artistUri.id;
        const track = trackFormat.uri;

        this.insert(artist, track);
      });

    });
  }

  // takes in variable parameters
  constructor(params?: { tracks?: Array<TrackFormat>, artistMap?: { [artist: string]: Array<string> } /*Map<string, Set<string>>*/ }) {
    // map has to exist before inserting, so this must come first
    this.artists = new Map();

    if (params) {

      if (params.artistMap) {
        for (const artist in params.artistMap) {
          for (let i = 0; i < params.artistMap[artist].length; ++i) {
            this.insert(artist, params.artistMap[artist][i]);
          }
        }
      }

      if (params.tracks) {
        this.transformTracks(params.tracks);
      }
    }

  }
}
