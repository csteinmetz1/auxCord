import {
  existsSync,
  readFileSync,
  unlink
} from 'fs'

import {
  UserData
} from './Types'



function userLocation(auxId: number) {
  return 'data/' + auxId + '.json'
}


export function userIdExists(auxId: number) {
  return existsSync(userLocation(auxId))
}

export function getNewAuxId(): number {
  var auxId = Math.floor(1000 + Math.random() * 9000);

  while (userIdExists(auxId)) {
    auxId = Math.floor(1000 + Math.random() * 9000);
  }

  console.log('Creating new aux', auxId);
  return auxId;
}



export function getUserById(auxId: number): UserData {
  if (!userIdExists(auxId))
    throw new Error(`AuxId '${auxId}' does not exist`)

  return JSON.parse(readFileSync(userLocation(auxId), 'utf-8'))
}


export function deleteById(auxId: number): void {

  unlink(userLocation(auxId), (err) => {
    if (err) throw err;

    console.log(`Deleted auxCord entry for '${auxId}'`)
  })
}