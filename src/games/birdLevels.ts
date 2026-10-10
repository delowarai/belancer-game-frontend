export const birdLevels = [
  {name:'City Arrival',shots:4,coins:50,badge:'First Wings',towers:[[650,70],[840,90]]},
  {name:'Market Street',shots:4,coins:65,badge:'Street Flyer',towers:[[600,100],[870,120]]},
  {name:'Rooftop Run',shots:5,coins:80,badge:'Roof Runner',towers:[[530,80],[710,130],[900,100]]},
  {name:'Tower District',shots:5,coins:95,badge:'Tower Seeker',towers:[[550,130],[730,90],[910,160]]},
  {name:'Golden Hour',shots:5,coins:110,badge:'Sunset Scout',towers:[[510,150],[705,110],[900,170]]},
  {name:'Bridge Quarter',shots:6,coins:125,badge:'Bridge Ranger',towers:[[460,90],[610,150],[760,110],[920,170]]},
  {name:'Skyline Heights',shots:6,coins:140,badge:'Skyline Hero',towers:[[470,170],[620,110],[770,180],[920,140]]},
  {name:'Steel Avenue',shots:6,coins:155,badge:'Steel Wings',towers:[[480,180],[625,150],[770,100],[920,190]]},
  {name:'Midnight Flight',shots:6,coins:170,badge:'Night Guardian',towers:[[470,150],[620,190],[770,120],[920,200]]},
  {name:'Citadel Rooftops',shots:7,coins:185,badge:'Citadel Master',towers:[[440,100],[555,180],[675,130],[790,200],[915,160]]},
  {name:'City Champion',shots:7,coins:200,badge:'Bird Champion',towers:[[440,190],[555,130],[675,210],[790,160],[915,220]]},
];
export type BirdProgress={stars:number[];points:number[]};
export function readBirdProgress(value:string|null):BirdProgress{
  try{const parsed=JSON.parse(value||'{}');const stars=birdLevels.map((_,i)=>Number.isInteger(parsed.stars?.[i])?Math.max(0,Math.min(3,parsed.stars[i])):0);return {stars,points:birdLevels.map((level,i)=>Number.isInteger(parsed.points?.[i])?Math.max(0,Math.min(10000,parsed.points[i])):stars[i]>0?level.towers.length*100:0)}}catch{return {stars:birdLevels.map(()=>0),points:birdLevels.map(()=>0)}}
}
export function completeBirdLevel(progress:BirdProgress,index:number,shotsRemaining:number):BirdProgress{
  const stars=[...progress.stars],points=[...progress.points];stars[index]=Math.max(stars[index]||0,shotsRemaining>=2?3:shotsRemaining===1?2:1);points[index]=Math.max(points[index]||0,birdLevels[index].towers.length*100+shotsRemaining*50);return {stars,points};
}
export function birdCoins(progress:BirdProgress){return birdLevels.reduce((sum,level,i)=>sum+(progress.stars[i]>0?level.coins:0),0)}
export function birdPoints(progress:BirdProgress){return progress.points.reduce((sum,points)=>sum+points,0)}
// Every step increases mass/impact resistance and reduces the shots per target.
export function birdDifficulty(index:number){return {density:.002+index*.0004,impact:2.4+index*.15,shield:index<3?0:Math.floor((index-1)/2),theme:Math.floor(index/4)}}
