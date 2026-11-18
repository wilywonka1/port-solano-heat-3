// Pedestrians: wander, chat pairs, joggers, shop browsers, flee and fall.
import {ROAD_X,ROAD_Z,clamp} from "./config.js";
const SKIN=[0xf2c79b,0xc68863,0x8d5524,0xffe0bd],SHIRT=[0xe74c3c,0x3498db,0x2ecc71,0xf39c12,0x9b59b6,0xecf0f1,0x1abc9c,0xe67e22,0xfd79a8,0x00cec9];
export function makePedMesh(rng,shirt){const g=new THREE.Group();const s=new THREE.MeshLambertMaterial({color:shirt||SHIRT[Math.floor(rng()*SHIRT.length)]});const skin=new THREE.MeshLambertMaterial({color:SKIN[Math.floor(rng()*SKIN.length)]});
 const body=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.85,0.3),s);body.position.y=0.95;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),skin);head.position.y=1.62;g.add(head);
 const legs=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.55,0.28),new THREE.MeshLambertMaterial({color:0x2c3e50}));legs.position.y=0.28;g.add(legs);return g}
export function createPeds(scene,rng,count=34){
 const peds=[];
 function spawn(i){const onBeach=i>26;const x=onBeach?-200+rng()*400:-205+rng()*410,z=onBeach?192+rng()*14:-195+rng()*360;
  const mesh=makePedMesh(rng);mesh.position.set(x,0,z);scene.add(mesh);
  const kind=i<4?"chat":(onBeach?"jog":"walk"); // first pairs chat
  peds.push({mesh,x,z,angle:rng()*6.28,speed:kind==="jog"?3.4:1.1+rng()*0.7,health:30,state:kind,tx:x,tz:z,t:rng()*4,phase:rng()*6,taxi:false,fall:0,chatPartner:null})}
 for(let i=0;i<count;i++)spawn(i);
 if(peds[0]&&peds[1]){peds[1].x=peds[0].x+1;peds[1].z=peds[0].z+0.4;peds[0].chatPartner=peds[1];peds[1].chatPartner=peds[0]}
 return peds;
}
export function updatePeds(peds,dt,G){
 for(const p of peds){
  if(p.state==="down"){p.fall-=dt;p.mesh.rotation.x=Math.PI/2*0.9;p.mesh.position.y=0.2;if(p.fall<=0){p.state="walk";p.health=30;p.mesh.rotation.x=0;p.mesh.position.y=0}continue}
  if(p.state==="inTaxi"||p.state==="done")continue;
  let move=true;
  const threat=G.playerCar&&G.wanted>0?G.playerCar:(G.player&&!G.inCar?null:null);
  const px=G.inCar?G.playerCar.x:G.player.x,pz=G.inCar?G.playerCar.z:G.player.z;
  const d=Math.hypot(p.x-px,p.z-pz);
  if(d<7&&((G.inCar&&Math.abs(G.playerCar.speed)>4)||G.wanted>=2)){p.state="flee"}
  if(p.state==="flee"){p.angle=Math.atan2(p.x-px,p.z-pz);p.x+=Math.sin(p.angle)*4.2*dt;p.z+=Math.cos(p.angle)*4.2*dt;if(d>16)p.state="walk"}
  else if(p.state==="chat"){move=false;p.mesh.position.y=Math.abs(Math.sin(performance.now()/400+p.phase))*0.04;if(p.chatPartner)p.angle=Math.atan2(p.chatPartner.x-p.x,p.chatPartner.z-p.z)}
  else if(p.state==="jog"){p.x+=Math.sin(p.angle)*p.speed*dt;if(p.x>210||p.x<-210)p.angle=-p.angle;p.z=196+Math.sin(p.x*0.05+p.phase)*3}
  else{p.t-=dt;if(p.t<=0){p.t=3+Math.random()*4; // wander near sidewalks / shopfronts
    const rx=ROAD_X[Math.floor(Math.random()*ROAD_X.length)],rz=ROAD_Z[Math.floor(Math.random()*ROAD_Z.length)];
    p.tx=(Math.random()>0.5?rx+(Math.random()>0.5?9:-9):p.x+(Math.random()*30-15));p.tz=(Math.random()>0.5?rz+(Math.random()>0.5?9:-9):p.z+(Math.random()*30-15));p.tx=clamp(p.tx,-215,215);p.tz=clamp(p.tz,-200,205)}
   const dd=Math.hypot(p.tx-p.x,p.tz-p.z);if(dd>0.5){p.angle=Math.atan2(p.tx-p.x,p.tz-p.z);p.x+=Math.sin(p.angle)*p.speed*dt;p.z+=Math.cos(p.angle)*p.speed*dt}else if(Math.random()<0.002)p.state="browse";
   if(p.state==="browse"){move=false;if(Math.random()<0.01)p.state="walk"}}
  // hit by player car
  if(G.inCar&&Math.abs(G.playerCar.speed)>3&&Math.hypot(p.x-G.playerCar.x,p.z-G.playerCar.z)<1.8){p.state="down";p.fall=4;p.health=0;G.onPedHit&&G.onPedHit(p)}
  p.mesh.position.set(p.x,move?Math.abs(Math.sin(performance.now()/180+p.phase))*0.05:p.mesh.position.y,p.z);p.mesh.rotation.y=p.angle;
 }
}
