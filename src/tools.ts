/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
export function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var text = '';

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export function transformTracks(tracks) {
  // tracks are stored in a hash table
  // Note: there is no length attribute though.
  var trackTable = {};
  for (let i = 0; i < tracks.length; i++) {
    let artistUris = tracks[i].artists

    for (let j = 0; j < artistUris.length; j++) {
      let artistId = artistUris[j].id;
      let trackId = tracks[i].uri;

      if (trackTable[artistId] === undefined) { trackTable[artistId] = {}; }

      trackTable[artistId][trackId] = true;
    }
  };
  return trackTable;
}

export function mergeTracks(a, b) {
  return Object.assign(a, b);
}