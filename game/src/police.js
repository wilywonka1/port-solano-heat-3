// Police cars pursue/ram; foot officers at 3+ stars chase and fire tracers.
import {Car} from "./vehicles.js";
import {makePedMesh} from "./pedestrians.js";
export function createPolice(scene){return{cars:[],officers:[],scene,spawnT:0}}
export function ensurePolice(P,G,dt){
 const want=G.wanted===0?0:Math.min(2+G.wanted,6);
 P.spawnT-=dt;
 if(P.cars.length<want&&P.spawnT<=0){P.spawnT=1.2;const a=Math.random()*6.28,r=55+Math.random()*20;
  const c=new Car(P.scene,"police",0x1a2a4a,G.playerPos.x+Math.sin(a)*r,G.playerPos.z+Math.cos(a)*r,0);c.isPolice=true;P.cars.push(c);G.allCars.push(c)}
 if(G.wanted>=3&&P.officers.length<Math.min(4,G.wanted)){const m=makePedMesh(Math.random,0x1a2a4a);m.position.set(G.playerPos.x+20,0,G.playerPos.z+10);P.scene.add(m);P.officers.push({mesh:m,x:G.playerPos.x+18,z:G.playerPos.z+10,health:40,fireT:Math.random()})}
 // clean up when no wanted
 if(G.wanted===0){for(const c of P.cars){P.scene.remove(c.mesh);const i=G.allCars.indexOf(c);if(i>=0)G.allCars.splice(i,1)}P.cars=[];for(const o of P.officers)P.scene.remove(o.mesh);P.officers=[]}
}
export function updatePolice(P,dt,G){
 for(const c of P.cars){const dx=G.playerPos.x-c.x,dz=G.playerPos.z-c.z,d=Math.hypot(dx,dz);const ta=Math.atan2(dx,dz);let da=ta-c.angle;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  c.angle+=Math.max(-1.8*dt,Math.min(1.8*dt,da*2));
  const target=d>6?17+G.wanted*1.6:8;c.speed+=((target)-c.speed)*Math.min(1,dt*1.5);
  const nx=c.x+Math.sin(c.angle)*c.speed*dt,nz=c.z+Math.cos(c.angle)*c.speed*dt;
  if(!G.collide(nx,nz,1.6)){c.x=nx;c.z=nz}else c.speed*=-0.4;
  c.sync();const bar=c.mesh.getObjectByName("lightbar");if(bar)bar.material.color.setHex(Math.floor(performance.now()/220)%2?0xff3344:0x3388ff);
  if(d<3.2&&G.inCar){G.damageCar&&G.damageCar(6*dt*(5-G.wanted*0.4));if(Math.abs(G.playerCar.speed)<1)G.bustTimer+=dt; }
 }
 for(const o of P.officers){const dx=G.playerPos.x-o.x,dz=G.playerPos.z-o.z,d=Math.hypot(dx,dz);if(d>3){o.x+=dx/d*3.2*dt;o.z+=dz/d*3.2*dt}
  o.mesh.position.set(o.x,0,o.z);o.mesh.rotation.y=Math.atan2(dx,dz);
  o.fireT-=dt;if(o.fireT<=0&&d<28&&!G.inCar){o.fireT=0.9+Math.random()*0.6;G.onOfficerShoot&&G.onOfficerShoot(o)}else if(o.fireT<=0&&d<28){o.fireT=0.9;G.onOfficerShoot&&G.onOfficerShoot(o)}
  if(o.health<=0){o.mesh.rotation.x=Math.PI/2}}
 P.officers=P.officers.filter(o=>o.health>0||Math.random()>0.001);
}
