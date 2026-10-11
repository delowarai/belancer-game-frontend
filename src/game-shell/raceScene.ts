import * as THREE from 'three';
import type {RaceState} from '../games/racing';

function box(w:number,h:number,d:number,color:string){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.18}));mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
export function makeRaceCar(color:string,kind=0){
 const car=new THREE.Group();const body=box(1.5,.5,3,color);body.position.y=.65;car.add(body);
 const cabin=box(1.22,.6,kind===2?1.4:1.7,'#172a35');cabin.position.set(0,1.15,.2);car.add(cabin);
 const roof=box(1.26,.12,1.2,color);roof.position.set(0,1.5,.2);car.add(roof);
 const hood=box(1.4,.15,.8,color);hood.position.set(0,.98,-1);car.add(hood);
 for(const x of [-.78,.78])for(const z of [-.95,.95]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.2,16),new THREE.MeshStandardMaterial({color:'#15191c'}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.35,z);car.add(wheel);const rim=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.215,12),new THREE.MeshStandardMaterial({color:'#a5bac2',metalness:.85,roughness:.3}));rim.rotation.z=Math.PI/2;rim.position.copy(wheel.position);car.add(rim)}
 for(const x of [-.5,.5]){const tail=box(.36,.13,.07,'#ff625b');tail.position.set(x,.83,1.54);car.add(tail);const lamp=box(.4,.14,.06,'#f8f4c7');lamp.position.set(x,.87,-1.53);car.add(lamp)}
 const plate=box(.55,.13,.06,'#ecf2d9');plate.position.set(0,.66,1.55);car.add(plate);
 if(kind>0){const wing=box(1.6,.09,.3,'#243337');wing.position.set(0,1.1,1.32);car.add(wing)}return car;
}
export class RaceScene{
 private renderer:THREE.WebGLRenderer;private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(58,1,.1,600);
 private player:THREE.Group;private rivals:THREE.Group[];private traffic:THREE.Group[];private roadside:THREE.Group[]=[];private stripes:THREE.Mesh[]=[];private finish=new THREE.Group();private resize:ResizeObserver;
 constructor(private canvas:HTMLCanvasElement,state:RaceState,color:string,kind:number){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const night=state.level%4===1,sky=night?'#17253c':state.level%4===3?'#dba878':'#91cbd0';this.scene.background=new THREE.Color(sky);this.scene.fog=new THREE.Fog(sky,70,280);
  this.scene.add(new THREE.HemisphereLight(night?'#b6d3f1':'#fff4d9','#38483c',2));const sun=new THREE.DirectionalLight('#fff0c8',night?1:2.8);sun.position.set(-25,40,25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-16;sun.shadow.camera.right=16;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;this.scene.add(sun);
  const ground=box(800,.1,800,state.level%4===3?'#b59669':state.level%4===2?'#4e958d':'#638365');ground.position.set(0,-.15,-180);this.scene.add(ground);
  const road=box(11,.06,600,'#303c43');road.position.set(0,-.03,-230);this.scene.add(road);
  for(const x of [-5.3,5.3]){const edge=box(.15,.07,600,'#e3dbbc');edge.position.set(x,.02,-230);this.scene.add(edge);const rail=box(.16,.35,600,'#8bacae');rail.position.set(x*1.15,.65,-230);this.scene.add(rail)}
  for(let i=0;i<70;i++)for(const x of [-1.67,1.67]){const stripe=box(.12,.02,3,'#e7e4ce');stripe.position.set(x,.025,-i*8);this.stripes.push(stripe);this.scene.add(stripe)}
  for(let i=0;i<50;i++){const group=new THREE.Group(),side=i%2?-1:1;group.position.set(side*(10+i%4*3),0,-i*11);if(state.level%4===1){const building=box(4,5+i%6*2,4,['#344557','#475265','#3f6172'][i%3]);building.position.y=(5+i%6*2)/2;group.add(building);for(let j=0;j<4;j++){const window=box(4.02,.45,.1,'#c7db8c');window.position.set(0,2+j*2,2.02);group.add(window)}}else{const trunk=box(.3,2,.3,'#755139');trunk.position.y=1;group.add(trunk);const leaves=new THREE.Mesh(new THREE.ConeGeometry(1.5,3.5,7),new THREE.MeshStandardMaterial({color:state.level%4===3?'#9a9853':'#285f50'}));leaves.position.y=3;group.add(leaves)}this.roadside.push(group);this.scene.add(group)}
  this.player=makeRaceCar(color,kind);this.scene.add(this.player);this.rivals=state.rivals.map(r=>{const car=makeRaceCar(r.color,1);this.scene.add(car);return car});this.traffic=state.traffic.map(t=>{const car=makeRaceCar(t.color);this.scene.add(car);return car});
  for(const x of [-5,5]){const pole=box(.2,6,.2,'#d1e0dc');pole.position.set(x,3,0);this.finish.add(pole)}
  for(let x=0;x<20;x++)for(let y=0;y<2;y++){const square=box(.5,.5,.08,(x+y)%2?'#182525':'#eff6eb');square.position.set(-4.75+x*.5,5+y*.5,0);this.finish.add(square)}this.scene.add(this.finish);
  this.resize=new ResizeObserver(()=>this.updateSize());this.resize.observe(canvas);this.updateSize();this.draw(state);
 }
 private updateSize(){const width=this.canvas.clientWidth,height=this.canvas.clientHeight;this.renderer.setSize(width,height,false);this.camera.aspect=width/Math.max(1,height);this.camera.updateProjectionMatrix()}
 draw(state:RaceState){
  this.player.position.set(state.x,.03,0);this.player.rotation.z=state.cooldown>0?Math.sin(state.elapsed*30)*.035:0;this.player.rotation.y=state.x*.018;
  this.camera.position.set(state.x*.22,5.2,10);this.camera.lookAt(state.x*.15,.7,-22);
  for(let i=0;i<this.rivals.length;i++){const r=state.rivals[i],car=this.rivals[i];car.position.set(r.x,0,-(r.distance-state.distance)*.4);car.visible=car.position.z<12&&car.position.z>-260}
  for(let i=0;i<this.traffic.length;i++){const t=state.traffic[i],car=this.traffic[i];car.position.set(t.x,0,-(t.distance-state.distance)*.4);car.visible=car.position.z<12&&car.position.z>-260}
  const offset=state.distance*.4;this.stripes.forEach((stripe,i)=>stripe.position.z=10-((Math.floor(i/2)*8-offset)%560+560)%560);this.roadside.forEach((group,i)=>group.position.z=20-((i*11-offset)%550+550)%550);
  this.finish.position.z=-(650+state.level*70-state.distance)*.4;this.finish.visible=state.mode==='career'||state.mode==='challenge';this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.resize.disconnect();this.scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose())}});this.renderer.dispose()}
}
