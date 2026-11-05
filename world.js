(() => {
const size=9;
const terrain=Array.from({length:size*size},(_,i)=>{const x=i%size,y=Math.floor(i/size);if((x===0&&y<3)||(x===8&&y>5)||(x===7&&y===0))return 'water';if((x<2&&y>5)||(x>6&&y<3)||(x===2&&y===1))return 'forest';if((x===0&&y===5)||(x===8&&y===2)||(x===6&&y===8))return 'rock';return 'grass'});
// WHY: the starting houses each need a road-adjacent tile so the first settlement can function immediately.
const initial={40:{type:'road'},41:{type:'road'},42:{type:'road'},31:{type:'house'},49:{type:'house'}};
function neighbors(id){const x=id%size,y=Math.floor(id/size);return [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>a>=0&&a<size&&b>=0&&b<size).map(([a,b])=>b*size+a)}
function roadSet(tiles){const roads=Object.keys(tiles).map(Number).filter(i=>tiles[i].type==='road');if(!roads.length)return new Set();const seen=new Set([roads[0]]),q=[roads[0]];while(q.length){for(const n of neighbors(q.shift()))if(!seen.has(n)&&tiles[n]?.type==='road'){seen.add(n);q.push(n)}}return seen}
function hasAccess(id,tiles){const roads=roadSet(tiles);return neighbors(id).some(n=>roads.has(n))}
function canBuild(id,kind,tiles){if(tiles[id])return false;const t=terrain[id];if(kind==='road')return t!=='water';if(!hasAccess(id,tiles))return false;if(kind==='lumber')return t==='forest'||t==='grass';if(kind==='quarry')return t==='rock'||t==='grass';return t==='grass'}
window.World={size,terrain,initial,neighbors,roadSet,hasAccess,canBuild};
})();