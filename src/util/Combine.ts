import { UserModel } from "../models/User";
import { IntersectKeys } from "../models/TrackTable";


class Artist {
  entries: Array<string>;

  inA: number;
  inB: number;
  inBoth: number;

  selectedSoFar: number;

  weight: number;

  // used when selecting from the tree
  totalWeight: number;


  // compute the selection weight for this element
  update() {
    const { entries, inA, inB, inBoth, selectedSoFar } = this;
    const { pow } = Math;

    this.weight = entries.length
      * pow(2.0, inBoth) // most important metric
      * pow(1.2, inA + inB) // if its in a or b it is kind of important
      / pow(1.5, selectedSoFar); // becomes less than half as likely after each selection
  }

  constructor(isect: IntersectKeys) {
    this.entries = [...(new Set([...isect.a, ...isect.b])).keys()];

    const totalA = isect.a.size;
    const totalB = isect.b.size;

    this.inBoth = totalA + totalB - this.entries.length;

    this.inA = totalA - this.inBoth;
    this.inB = totalB - this.inBoth;

    this.selectedSoFar = 0;
    this.update();
  }

  takeEntry() {
    const { entries } = this;
    if (entries.length === 0)
      throw new Error("The total should never be 0");

    this.selectedSoFar++; // increment since one track was selected from this artist
    const entry = entries.pop();

    this.update(); // update the weight on this artist

    return entry;
  }
}




interface ProbabilityElement {
  weight: number;
  totalWeight: number;
  takeEntry: () => any;
  update: () => void;
}
// O(log(n)) selects and weight fixes
class ProbabilityHeap {
  private data: Array<ProbabilityElement>;

  private siftLeft = (i: number) => (i * 2 + 1);
  private siftRight = (i: number) => ((i + 1) * 2);

  private leftWeight = (i: number) => {
    const left = this.siftLeft(i);
    return left < this.data.length ? this.data[left].totalWeight : 0;
  }

  private rightWeight = (i: number) => {
    const right = this.siftRight(i);
    return right < this.data.length ? this.data[right].totalWeight : 0;
  }

  private fixWeight = (i: number) => {

    const right = this.siftRight(i);

    this.data[i].totalWeight = this.data[i].weight + this.leftWeight(i) + this.rightWeight(i);
  }


  constructor(data: Array<ProbabilityElement>) {
    this.data = data;
    // fix the weights in the heap
    for (let i = data.length - 1; i >= 0; i--) {
      data[i].update();
      this.fixWeight(i);
    }
  }


  private takeRandomly = (i: number): any => {
    if (this.data.length <= i || this.data[i].totalWeight === 0)
      throw new Error("Elements weights should be 0 if there are no entries left");


    const selection = Math.random() * this.data[i].totalWeight;
    let entry = null;

    const left = this.siftLeft(i);
    const leftTotalWeight = this.leftWeight(i);

    if (selection < this.data[i].weight)
      entry = this.data[i].takeEntry();

    else if (selection < this.data[i].weight + leftTotalWeight)
      entry = this.takeRandomly(left);

    else
      entry = this.takeRandomly(this.siftRight(i));

    this.fixWeight(i);
    return entry;
  }


  take = () => {
    if (this.data.length < 1 || this.data[0].totalWeight === 0)
      return null;

    return this.takeRandomly(0);
  }

}


export function GetMatches(userA: UserModel, userB: UserModel, maxMatches: number): { matches: Array<string>, percent_match: number } {
  console.log("User A: ", userA.userId, userA.totalTracks, userA.totalArtists);
  console.log("User B: ", userB.userId, userB.totalTracks, userB.totalArtists);

  const matches: Array<string> = [];
  const common = userA.tracks.getIntersectKeys(userB.tracks);
  const selector = new ProbabilityHeap(
    common.map((isect: IntersectKeys) => (
      new Artist(isect)
    ))
  );

  maxMatches = Math.floor(maxMatches);
  let entry = null;
  while (maxMatches && (entry = selector.take()) !== null) {

    matches.push(entry);
    maxMatches--;

  }

  const percent_match = 100 * common.length / Math.min(userA.totalArtists, userB.totalArtists);
  const result = { matches, percent_match };
  console.log(result);
  return result;
}
