import { existsSync } from 'fs'

export function getNewAuxId(): number {
  var auxId = Math.floor(1000 + Math.random() * 9000);

  while (existsSync('data/' + auxId + '.json')) {
    auxId = Math.floor(1000 + Math.random() * 9000);
  }

  console.log('Creating new aux', auxId);
  return auxId;
}