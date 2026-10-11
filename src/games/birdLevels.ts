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
  {name:'Harbor Heights',shots:7,coins:215,badge:'Harbor Heights Master',towers:[[500,110],[605,163],[710,216],[815,129],[920,182]]},
  {name:'Copper Crossing',shots:7,coins:235,badge:'Copper Crossing Master',towers:[[500,141],[605,194],[710,247],[815,160],[920,213]]},
  {name:'Clocktower Lane',shots:7,coins:255,badge:'Clocktower Lane Master',towers:[[500,172],[605,225],[710,138],[815,191],[920,244]]},
  {name:'River Rooftops',shots:6,coins:275,badge:'River Rooftops Master',towers:[[500,203],[605,116],[710,169],[815,222],[920,135]]},
  {name:'Neon Passage',shots:6,coins:295,badge:'Neon Passage Master',towers:[[500,234],[605,147],[710,200],[815,113],[920,166]]},
  {name:'Iron Gardens',shots:6,coins:315,badge:'Iron Gardens Master',towers:[[500,125],[605,178],[710,231],[815,144],[920,197]]},
  {name:'Skybridge Siege',shots:6,coins:335,badge:'Skybridge Siege Master',towers:[[500,156],[605,209],[710,122],[815,175],[920,228]]},
  {name:'Metro Fortress',shots:7,coins:355,badge:'Metro Fortress Master',towers:[[430,187],[530,240],[630,153],[730,206],[830,119],[930,172]]},
  {name:'Storm Terrace',shots:7,coins:375,badge:'Storm Terrace Master',towers:[[430,218],[530,131],[630,184],[730,237],[830,150],[930,203]]},
  {name:'Crimson Quarter',shots:7,coins:395,badge:'Crimson Quarter Master',towers:[[430,249],[530,162],[630,215],[730,128],[830,181],[930,234]]},
  {name:'Highrise Maze',shots:7,coins:415,badge:'Highrise Maze Master',towers:[[430,140],[530,193],[630,246],[730,159],[830,212],[930,125]]},
  {name:'Moonlight Bastion',shots:7,coins:435,badge:'Moonlight Bastion Master',towers:[[430,171],[530,224],[630,137],[730,190],[830,243],[930,156]]},
  {name:'Steel Summit',shots:7,coins:455,badge:'Steel Summit Master',towers:[[430,202],[530,115],[630,168],[730,221],[830,134],[930,187]]},
  {name:'Cloud Citadel',shots:6,coins:475,badge:'Cloud Citadel Master',towers:[[430,233],[530,146],[630,199],[730,112],[830,165],[930,218]]},
  {name:'Thunder Avenue',shots:6,coins:495,badge:'Thunder Avenue Master',towers:[[430,124],[530,177],[630,230],[730,143],[830,196],[930,249]]},
  {name:'Nightfall Keep',shots:6,coins:515,badge:'Nightfall Keep Master',towers:[[430,155],[530,208],[630,121],[730,174],[830,227],[930,140]]},
  {name:'Skyline Gauntlet',shots:6,coins:535,badge:'Skyline Gauntlet Master',towers:[[430,186],[530,239],[630,152],[730,205],[830,118],[930,171]]},
  {name:'Final Ascent',shots:6,coins:555,badge:'Final Ascent Master',towers:[[430,217],[530,130],[630,183],[730,236],[830,149],[930,202]]},
  {name:'Crown of the City',shots:6,coins:575,badge:'Crown of the City Master',towers:[[430,248],[530,161],[630,214],[730,127],[830,180],[930,233]]},
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
export function birdDifficulty(index:number){return {density:.002+index*.0004,impact:2.4+index*.15,shield:index<3?0:Math.min(4,Math.floor((index-1)/2)),theme:index<5?0:index<15?1:2,tier:index<5?'Easy':index<15?'Medium':'Hard'}}

export function birdRewardReady(clearedAt:number|null,flightTime:number,flightFinished:boolean){return clearedAt!==null&&flightTime-clearedAt>=1400&&flightFinished}

export function birdShieldPositions(index:number){const count=birdDifficulty(index).shield,firstTower=birdLevels[index].towers[0][0];return Array.from({length:count},(_,i)=>firstTower-80-(count-1-i)*28)}
export function birdPhysicsActive(shotsRemaining:number,initialShots:number){return shotsRemaining<initialShots}
