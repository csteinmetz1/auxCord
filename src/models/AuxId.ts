import mongoose from "mongoose";
mongoose.Promise = require("bluebird");


/*
 * Keeps track of which auxIds are currently being used and gives
 * users an Id if it runs out One problem to be encountered or tested
 * is how long expansion takes.
 */

const minimumNumberOfIds = 1000;

interface AuxIdRecord extends mongoose.Document {
  auxId: string;
  created_at: Date;
}

const auxIdActiveSchema = new mongoose.Schema({
  auxId: { type: String, index: true, unique: true },
  created_at: { type: Date, required: true, default: Date.now }
});
const AuxIdActive = mongoose.model("AuxIdActive", auxIdActiveSchema);


const auxIdFreeSchema = new mongoose.Schema({
  auxId: { type: String, index: true, unique: true },
  created_at: { type: Date, required: true, default: Date.now }
});
const AuxIdFree = mongoose.model("AuxIdFree", auxIdFreeSchema);


/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a: Array<any>) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/**
 * Adds new auxIds to the free model It returns a promise for when the
 * first record is made available so we don't have to wait for them
 * all
 * @param {Number} oldTotal - old and current total of number of records
 * @param {Number} newTotal - new and final number of records
 */
function expandFreeAuxIds(oldTotal: number, newTotal: number) {
  const newIds = [];
  for (let i = oldTotal; i < newTotal; i++) {
    newIds.push(i);
  }
  shuffle(newIds);

  // this must occur before someone queries for another auxId
  const syncPromise = (new AuxIdFree({ auxId: newIds[0] })).save();
  for (let i = 1; i < newIds.length; i++) {
    (new AuxIdFree({ auxId: newIds[i] })).save();
  }

  return syncPromise;
}


// please return your auxIds or we will be keeping track of additional in use things. Thanks!
export let getAuxId = () => {
  return Promise
    .all([AuxIdActive.count({}), AuxIdFree.count({})])
    .then(([active, free]) => {
      let total = active + free;
      const oldTotal = total;


      if (total < minimumNumberOfIds) {
        total = minimumNumberOfIds;
      }

      // if we are at 70% usage, we should allocate more
      if (free < Math.floor(total * .70) || free === 0) {
        total *= 2;
      }
      let promise: Promise<any> = Promise.resolve();
      if (oldTotal < total) {
        promise = expandFreeAuxIds(oldTotal, total);
        free = total - active;
      }

      return promise.then(() => ({ active, free, total }));
    })
    .then(({ active, free, total }) => {
      // console.log("active: " + active);
      // console.log("free: " + free);
      // console.log("total: " + total);

      return AuxIdFree.findOneAndRemove().sort({ "created_at": 1 }).exec().then((record: AuxIdRecord) => {
        console.log("found auxId: " + record.auxId);
        (new AuxIdActive({ auxId: record.auxId })).save();
        return record.auxId;
      });
    });
};

export let putAuxId = (auxId: string) => {
  return AuxIdActive.findOneAndRemove().where({ "auxId": auxId }).exec().then((record: AuxIdRecord | null) => (
    record === null ? Promise.resolve().then(() => (null))
      : (new AuxIdFree({ auxId: record.auxId })).save()
  ));
};
