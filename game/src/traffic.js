// Traffic AI on the road grid, plus a bus loop and delivery trucks. Boats patrol water.
import {ROAD_X,ROAD_Z,CAR_COLORS} from "./config.js";
import {Car} from "./vehicles.js";
export function createTraffic(scene,rng){
 const cars=[];const types=["sedan","sedan","sedan","truck","sedan"];
 for(let i=0;i<14;i++){const vert=i%2===0;const road=vert?ROAD_X[i%ROAD_X.length]:ROAD_Z[i%ROAD_Z.length];
  const x=vert?road:-200+rng()*400,z=vert?-180+rng()*330:road;
  const c=new Car(scene,types[i%types.length],CAR_COLORS[i%CAR_COLORS.length],x,z,vert?0:Math.PI/2);
  c.ai={vert,dir:rng()>0.5?1:-1,speed:8+rng()*4,road};c.angle=c.ai.vert?(c.ai.dir>0?0:Math.PI):(c.ai.dir>0?Math.PI/2:-Math.PI/2);c.sync();cars.push(c)}
 // bus loop
 const bus=new Car(scene,"bus",0xe8b13a,ROAD_X[0],ROAD_Z[0],0);bus.ai={loop:0,speed:9};bus.isBus=true;cars.push(bus);
 return cars;
}
const LOOP=[[-180,-160],[180,-160],[180,140],[-180,140]];
export function updateTraffic(cars,dt){
 for(const c of cars){
  if(c.occupied||c===undefined)continue;if(c.driverless===false&&c.isPlayerCar)continue;
  if(c.parked)continue;
  if(c.isBus){const t=LOOP[(c.ai.loop+1)%LOOP.length];const dx=t[0]-c.x,dz=t[1]-c.z,d=Math.hypot(dx,dz);
   if(d<4){c.ai.loop=(c.ai.loop+1)%LOOP.length;c.ai.pause=2}
   if(c.ai.pause>0){c.ai.pause-=dt;c.speed*=0.8}else{const ta=Math.atan2(dx,dz);let da=ta-c.angle;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;c.angle+=Math.max(-1.2*dt,Math.min(1.2*dt,da));c.speed=Math.min(10,c.speed+6*dt)}
   c.x+=Math.sin(c.angle)*c.speed*dt;c.z+=Math.cos(c.angle)*c.speed*dt;c.sync();continue}
  const ai=c.ai;if(!ai)continue;
  // move along current axis, turn randomly at intersections
  c.speed=ai.speed;c.angle=ai.vert?(ai.dir>0?0:Math.PI):(ai.dir>0?Math.PI/2:-Math.PI/2);
  if(ai.vert){c.z+=ai.dir*ai.speed*dt;const near=ROAD_Z.find(z=>Math.abs(c.z-z)<1.2);if(near!==undefined&&Math.random()<0.012){ai.vert=false;ai.road=near;ai.dir=Math.random()>0.5?1:-1;c.z=near}
   if(c.z>170){ai.dir=-1}if(c.z<-195){ai.dir=1}}
  else{c.x+=ai.dir*ai.speed*dt;const near=ROAD_X.find(x=>Math.abs(c.x-x)<1.2);if(near!==undefined&&Math.random()<0.012){ai.vert=true;ai.road=near;ai.dir=Math.random()>0.5?1:-1;c.x=near}
   if(c.x>215){ai.dir=-1}if(c.x<-215){ai.dir=1}}
  // lane offset
  const ox=ai.vert?2.2*ai.dir:0,oz=ai.vert?0:-2.2*ai.dir; // visual offset applied in sync position only via mesh
  c.sync();c.mesh.position.x=c.x+ox;c.mesh.position.z=c.z+oz;
 }
}
export function createBoats(scene,rng){
 const boats=[];const cols=[0xffffff,0xe74c3c,0x3498db];
 for(let i=0;i<3;i++){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(2.4,1,7),new THREE.MeshLambertMaterial({color:cols[i]}));hull.position.y=0.6;g.add(hull);const cab=new THREE.Mesh(new THREE.BoxGeometry(1.6,1,2),new THREE.MeshLambertMaterial({color:0xffffff}));cab.position.set(0,1.4,-0.5);g.add(cab);const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,5,5),new THREE.MeshLambertMaterial({color:0x888888}));mast.position.y=3;g.add(mast);g.position.set(60+i*55,0,265+i*12);scene.add(g);boats.push({mesh:g,phase:i*2.1,baseX:60+i*55,baseZ:265+i*12})}
 return boats;
}
export function updateBoats(boats,t){for(const b of boats){b.mesh.position.x=b.baseX+Math.sin(t*0.08+b.phase)*28;b.mesh.position.z=b.baseZ+Math.cos(t*0.06+b.phase)*8;b.mesh.rotation.y=Math.cos(t*0.08+b.phase)>0?Math.PI/2:-Math.PI/2;b.mesh.position.y=Math.sin(t+b.phase)*0.15}}
