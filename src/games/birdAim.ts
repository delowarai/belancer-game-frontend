export const BIRD_PULL = 105;
export const BIRD_SPEED = .21;
export const BIRD_AIR = .002;
export const BIRD_GRAVITY = .9;
export const BIRD_ANCHOR = {x:180,y:365};

export function aimPosition(angle:number,power:number){
  const radians=angle*Math.PI/180, distance=BIRD_PULL*power/100;
  return {x:BIRD_ANCHOR.x-Math.cos(radians)*distance,y:BIRD_ANCHOR.y+Math.sin(radians)*distance};
}

export function dragAim(point:{x:number;y:number}){
  const dx=BIRD_ANCHOR.x-point.x,dy=point.y-BIRD_ANCHOR.y;
  return {angle:Math.max(5,Math.min(65,Math.round(Math.atan2(dy,dx)*180/Math.PI))),power:Math.max(30,Math.min(100,Math.round(Math.hypot(dx,dy)/BIRD_PULL*100)))};
}

// Match Matter's fixed 60 Hz integration, including air friction and gravity.
export function trajectory(position:{x:number;y:number},steps=100){
  let {x,y}=position, vx=(BIRD_ANCHOR.x-x)*BIRD_SPEED,vy=(BIRD_ANCHOR.y-y)*BIRD_SPEED;
  const points:{x:number;y:number}[]=[];
  for(let step=1;step<=steps;step++){
    vx*=1-BIRD_AIR;vy=vy*(1-BIRD_AIR)+BIRD_GRAVITY*.001*(1000/60)**2;
    x+=vx;y+=vy;
    if(y>457||x>1000)break;
    if(step%4===0)points.push({x,y});
  }
  return points;
}
