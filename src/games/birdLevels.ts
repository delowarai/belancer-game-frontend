export const birdLevels = [
  {name:'First Flight',shots:3,coins:50,badge:'First Wings',towers:[[670,70],[785,70],[900,70]]},
  {name:'Garden Hop',shots:3,coins:65,badge:'Garden Explorer',towers:[[520,70],[720,70]]},
  {name:'High Branches',shots:4,coins:80,badge:'Sky Climber',towers:[[580,110],[830,110]]},
  {name:'Three Peaks',shots:4,coins:95,badge:'Peak Seeker',towers:[[500,70],[700,110],[900,70]]},
  {name:'Long Shot',shots:4,coins:110,badge:'Far Flyer',towers:[[760,90],[900,130]]},
  {name:'Forest Steps',shots:5,coins:125,badge:'Forest Ranger',towers:[[470,70],[620,90],[770,110],[920,130]]},
  {name:'Twin Summits',shots:4,coins:140,badge:'Summit Scout',towers:[[600,150],[860,150]]},
  {name:'Tower Trail',shots:5,coins:155,badge:'Trail Blazer',towers:[[480,110],[630,70],[780,130],[920,90]]},
  {name:'Skyline',shots:5,coins:170,badge:'Skyline Hero',towers:[[520,150],[710,130],[900,150]]},
  {name:'Grand Sweep',shots:6,coins:185,badge:'Master Aimer',towers:[[450,70],[565,110],[680,150],[795,110],[910,70]]},
  {name:'Bird Champion',shots:6,coins:200,badge:'Bird Champion',towers:[[460,150],[610,110],[760,170],[910,130]]},
];
export type BirdProgress={stars:number[]};
export function readBirdProgress(value:string|null):BirdProgress{
  try{const parsed=JSON.parse(value||'{}');return {stars:birdLevels.map((_,i)=>Number.isInteger(parsed.stars?.[i])?Math.max(0,Math.min(3,parsed.stars[i])):0)}}catch{return {stars:birdLevels.map(()=>0)}}
}
export function completeBirdLevel(progress:BirdProgress,index:number,shotsRemaining:number):BirdProgress{
  const stars=[...progress.stars];stars[index]=Math.max(stars[index]||0,shotsRemaining>=2?3:shotsRemaining===1?2:1);return {stars};
}
export function birdCoins(progress:BirdProgress){return birdLevels.reduce((sum,level,i)=>sum+(progress.stars[i]>0?level.coins:0),0)}
