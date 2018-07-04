
/*
 * The basic equation is quadriatic with respect to every variable,
 * but multiplied by the number of tracks left.
 *
 * total_tracks * (a0 * inBoth + a1 ^ inBoth + ...)
 */



/*
Venn Diagram:

             A               B
         -----------    -----------
      --/	    \--/  	   \--
    -/             -/  \-             \-
   /              /      \              \
  /  		 /        \	         \
 /              /          \              \
 |    notBoth   |  inBoth  |   notBoth    |
 \              \          /              /
  \  		 \        /	         /
   \              \      /              /
    -\             -\  /-             /-
      --\	    /--\  	   /--
         -----------    -----------
*/

/*
 * Do not make equation go negative. Not allowing for negative weights
 */


const Parameter = (a0: number, a1: number) => [a0, a1];

const p = {
  inBoth: Parameter(1, 2),
  notBoth: Parameter(1, 1 / 2),
  selectedSoFar: Parameter(0, 1 / 4)
};

const weightFunc = (inBoth: number, notBoth: number, selectedSoFar: number) => (
  (p.inBoth[0] * inBoth + Math.pow(p.inBoth[1], inBoth)) *
  (p.notBoth[0] * notBoth + Math.pow(p.notBoth[1], notBoth)) *
  (p.selectedSoFar[0] * selectedSoFar + Math.pow(p.selectedSoFar[1], selectedSoFar))
);


export default weightFunc;
