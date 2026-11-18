// Solano Heat: Golden Hour II — main loop, camera, wanted, weather, hooks, shot staging.
import {ROAD_X,ROAD_Z,GARAGE_POS,HOTEL_POS,MARINA_POS,DOCKS_POS,SPAWN,CONCHES,CHECKPOINTS,mulberry,clamp,fmt$} from "./config.js";
import {createAudio} from "./audio.js";import {loadSave,storeSave,defaultSave} from "./save.js";
import {buildCity,collide} from "./city.js";import {Car} from "./vehicles.js";
import {createPeds,updatePeds,makePedMesh} from "./pedestrians.js";
import {createTraffic,updateTraffic,createBoats,updateBoats} from "./traffic.js";
import {createPolice,ensurePolice,updatePolice} from "./police.js";
import {Player} from "./player.js";import {createCombat} from "./combat.js";
import * as M from "./missions.js";import * as Garage from "./garage.js";
import {drawMinimap} from "./minimap.js";import {el,toast,dialogue,fanfare,updateHUD} from "./hud.js";

const params=new URLSearchParams(location.search);const shot=params.get("shot");const rng=mulberry(Number(params.get("seed")||7)*1000+17);
const canvas=el("c");const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1));renderer.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xffb37a);scene.fog=new THREE.Fog(0xf2a56b,80,340);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,0.1,900);camera.position.set(0,8,50);
scene.add(new THREE.HemisphereLight(0xffd9a8,0x445566,0.95));
const sun=new THREE.DirectionalLight(0xffb066,1.5);sun.position.set(-80,55,-40);scene.add(sun);
const domeGeo=new THREE.SphereGeometry(420,16,10);const domeMat=new THREE.MeshBasicMaterial({color:0xff9e64,side:THREE.BackSide,fog:false});scene.add(new THREE.Mesh(domeGeo,domeMat));
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

const city=buildCity(scene,rng);const collideFn=(x,z,r)=>collide(city.colliders,x,z,r);
// wet-look overlays for rain
const wetMats=[];{const wm=new THREE.MeshLambertMaterial({color:0x11161c,transparent:true,opacity:0});for(const x of ROAD_X){const p=new THREE.Mesh(new THREE.PlaneGeometry(14,400),wm);p.rotation.x=-Math.PI/2;p.position.set(x,0.06,-10);scene.add(p)}for(const z of ROAD_Z){const p=new THREE.Mesh(new THREE.PlaneGeometry(440,14),wm);p.rotation.x=-Math.PI/2;p.position.set(0,0.06,z);scene.add(p)}wetMats.push(wm)}
// rain particles
const rainGeo=new THREE.BufferGeometry();{const n=700,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=(Math.random()-0.5)*90;pos[i*3+1]=Math.random()*35;pos[i*3+2]=(Math.random()-0.5)*90}rainGeo.setAttribute("position",new THREE.BufferAttribute(pos,3))}
const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xcfe8ff,size:0.35,transparent:true,opacity:0.85}));rain.visible=false;scene.add(rain);

const audio=createAudio();
let save=loadSave();const hadSave=!!localStorage.getItem("solano-heat-gh2-save-v1");
const player=new Player(scene);player.x=SPAWN.x;player.z=SPAWN.z;player.health=save.health||100;
const trafficCars=createTraffic(scene,rng);const boats=createBoats(scene,rng);const peds=createPeds(scene,rng);
const parked=[];for(let i=0;i<15;i++){const x=ROAD_X[i%ROAD_X.length]+4.4,z=-170+((i*53)%310);const c=new Car(scene,"sedan",[0xc23b2e,0x2e6fc2,0xe8b13a,0x3aa655,0xd8d8dc][i%5],x,z,0);c.parked=true;c.sync();parked.push(c)}
const allCars=[...trafficCars,...parked];
const police=createPolice(scene);const combat=createCombat(scene);
// story NPCs
function label(text){const cv=document.createElement("canvas");cv.width=256;cv.height=48;const g=cv.getContext("2d");g.fillStyle="rgba(0,0,0,.6)";g.fillRect(0,0,256,48);g.fillStyle="#ffd23f";g.font="bold 24px sans-serif";g.textAlign="center";g.fillText(text,128,32);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv)}));s.scale.set(5,0.95,1);s.position.y=2.3;return s}
function npc(name,x,z,shirt){const m=makePedMesh(rng,shirt);m.position.set(x,0,z);m.add(label(name));scene.add(m);return m}
npc("Rosa Delgado",-9,25,0xe74c3c);const titoNpc=npc("Tito Marlin",GARAGE_POS.x+8,0,GARAGE_POS.z+7,0xe67e22);npc("Cpt. Ilya Sorin",DOCKS_POS.x,DOCKS_POS.z,0x2471a3);
// conches
const conchList=CONCHES.map(([x,z],i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.55,8,6),new THREE.MeshBasicMaterial({color:0xffe27a}));m.scale.y=0.6;m.position.set(x,0.6,z);scene.add(m);return{x,z,mesh:m,taken:save.conches.includes(i)}});
conchList.forEach(c=>c.mesh.visible=!c.taken);
// M4 bags
const bagMeshes=[[105,245],[130,255],[155,245],[105,275],[170,270]].map(([x,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1,0.7,0.6),new THREE.MeshLambertMaterial({color:0x2ecc71}));m.position.set(x,0.5,z);m.visible=false;scene.add(m);return m});
// marker beacon
const beacon=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,34,12,1,true),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:0.35,side:THREE.DoubleSide}));beacon.visible=false;scene.add(beacon);
// checkpoint rings
const cpRing=new THREE.Mesh(new THREE.TorusGeometry(4,0.3,8,20),new THREE.MeshBasicMaterial({color:0xff8c1a}));cpRing.rotation.x=Math.PI/2;cpRing.visible=false;scene.add(cpRing);

const G={scene,save,audio,peds,police,combat,allCars,trafficCars,conches:conchList,collide:collideFn,
 wanted:0,health:player.health,inCar:false,playerCar:null,player,mission:{index:save.mission,active:false,stage:0,data:{}},taxi:null,taxiPed:null,delivery:null,marker:null,objective:"",weapon:"fists",garageOpen:false,paused:false,playing:false,weather:"clear",bustTimer:0,timerText:null,timerFrac:undefined,
 get playerPos(){return this.inCar&&this.playerCar?this.playerCar.pos:this.player.pos},get playerAngle(){return this.inCar&&this.playerCar?this.playerCar.angle:this.player.angle},
 persist(){this.save.health=Math.round(player.health);storeSave(this.save)},
 addCash(n){this.save.cash+=n;this.persist()},
 dialogue:(w,t,ms)=>dialogue(w,t,ms),toast:(t,ms)=>toast(t,ms),fanfare:(t,r)=>fanfare(t,r,save.cash,audio),
 setWanted(n){this.wanted=clamp(Math.round(n),0,5)},
 addWanted(n,why){if(this._wcd>0)return;this._wcd=2.5;this.wanted=clamp(this.wanted+n,0,5);if(n>0)toast(`★ Wanted ${this.wanted} — ${why||"crime"}`)},
 storyComplete(){el("storycomplete").style.display="flex";this.paused=true},
 onPedHit(p){this.addWanted(1,"hit a pedestrian");player.health=Math.max(20,player.health)},
 damageCar(n){if(this.playerCar)this.playerCar.health-=n},
 onOfficerShoot(o){audio.shoot();if(!this.inCar){player.health-=6;toast("Officer fire! Health dropping.")}else if(this.playerCar)this.playerCar.health-=3},
};
G._wcd=0;let sightT=0,reckT=0,garageCd=0,rainT=70,weatherMix=0;
window.__G=G;
// restore garage builds for parked/traffic by id if saved
for(const c of allCars){const s=save.garage[c.id];if(s){c.build=s;c.setColor(s.color)}}
function enterCar(c){if(!c||c.isPolice)return false;G.inCar=true;G.playerCar=c;c.occupied=true;c.parked=false;player.mesh.visible=false;
 const s=save.garage[c.id];if(s){c.build=s;c.setColor(s.color)}else Garage.garageStateFor(G,c);
 if(!c._owned){c._owned=true;G.addWanted(1,"car theft")}toast("🚗 In car — WASD drive, Space handbrake, Shift boost (nitro), E exit");return true}
function exitCar(){if(!G.playerCar)return;const c=G.playerCar;c.occupied=false;if(c.ai)c.parked=false;player.x=c.x+2.5;player.z=c.z;player.mesh.visible=true;G.inCar=false;G.playerCar=null;audio.setEngine(0,false)}
function nearestCar(){let best=null,bd=5;for(const c of allCars){const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd){bd=d;best=c}}return best}
function respawn(kind){player.health=100;G.health=100;G.wanted=0;G.bustTimer=0;const fine=Math.min(save.cash,Math.max(50,Math.round(save.cash*0.1)));save.cash-=fine;toast(`${kind==="busted"?"Busted":"Wasted"} — fee ${fmt$(fine)}`);if(G.inCar)exitCar();player.x=SPAWN.x;player.z=SPAWN.z;G.persist();el("busted").style.display="none";el("wasted").style.display="none";G.paused=false}
function startGame(cont){if(!cont){save=defaultSave();G.save=save;player.health=100;conchList.forEach((c,i)=>{c.taken=false;c.mesh.visible=true})}audio.init();el("start").style.display="none";G.playing=true;G.objective=save.mission<6?`Story: ${M.MISSION_NAMES[save.mission]} — press M to start.`:"Free roam — races (H), taxi (T), deliveries (L), Tito's Garage 🔧.";if(save.mission===0)dialogue("Rosa Delgado","Juno, it's Rosa. Press M — I have work for you in Port Solano.",6000)}
el("btn-new").onclick=()=>startGame(false);el("btn-continue").onclick=()=>startGame(true);
el("btn-resume").onclick=()=>{el("pause").style.display="none";G.paused=false};el("btn-busted").onclick=()=>respawn("busted");el("btn-wasted").onclick=()=>respawn("wasted");el("btn-story").onclick=()=>{el("storycomplete").style.display="none";G.paused=false};
el("start-save").textContent=hadSave?`Saved game found: ${fmt$(save.cash)}, next mission ${save.mission>=6?"— story complete":M.MISSION_NAMES[save.mission]}, conches ${save.conches.length}/10.`:"No saved game yet.";
if(!hadSave)el("btn-continue").style.opacity=0.5;
// input
const keys={};let yaw=0,pitch=0.32,mouseDown=false;
addEventListener("keydown",e=>{keys[e.code]=true;if(!G.playing)return;
 if(e.code==="KeyE"){if(G.garageOpen)Garage.closeGarage(G);else if(G.inCar)exitCar();else enterCar(nearestCar())}
 if(e.code==="KeyF"&&!G.inCar)combat.punch(G);
 if(e.code==="KeyR"&&G.weapon==="pistol")combat.reloading=1.1;
 if(e.code==="KeyM")M.startMission(G);if(e.code==="KeyT")M.startTaxi(G);if(e.code==="KeyL")M.startDelivery(G);if(e.code==="KeyH")M.startRace(G);
 if(e.code==="KeyP"||e.code==="Escape"){if(G.garageOpen)Garage.closeGarage(G);else{G.paused=!G.paused;el("pause").style.display=G.paused?"flex":"none"}}
 if(["Space","ArrowUp"].includes(e.code))e.preventDefault()});
addEventListener("keyup",e=>keys[e.code]=false);
canvas.addEventListener("click",()=>{audio.init();if(G.playing&&!G.paused&&document.pointerLockElement!==canvas)canvas.requestPointerLock&&canvas.requestPointerLock();
 if(G.playing&&!G.inCar&&G.weapon==="pistol"&&save.pistol){const dir={x:-Math.sin(yaw)*Math.cos(pitch),z:-Math.cos(yaw)*Math.cos(pitch)};combat.shoot(G,player.pos,{x:dir.x/Math.hypot(dir.x,dir.z),z:dir.z/Math.hypot(dir.x,dir.z)})}});
addEventListener("mousemove",e=>{if(document.pointerLockElement===canvas){yaw-=e.movementX*0.0026;pitch=clamp(pitch+e.movementY*0.002,-0.05,0.9)}});
addEventListener("mousedown",()=>mouseDown=true);addEventListener("mouseup",()=>mouseDown=false);
// weapon auto-select
setInterval(()=>{G.weapon=save.pistol?"pistol":"fists";const gun=player.mesh.getObjectByName("gun");if(gun)gun.visible=G.weapon==="pistol"&&!G.inCar},400);
function setWeather(w){G.weather=w;rain.visible=w==="rain";audio.setRain(w==="rain"&&G.playing);if(w==="rain")toast("🌧 Rain rolling in over Port Solano…")}
G.setWeather=setWeather;
// camera target smoothing
const camPos=new THREE.Vector3(0,7,55);let last=performance.now(),mmT=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(0.05,(now-last)/1000||0.016);last=now;const t=now/1000;
 if(G.playing&&!G.paused){
  G._wcd=Math.max(0,(G._wcd||0)-dt);garageCd-=dt;
  // player / car
  if(G.inCar&&G.playerCar){const c=G.playerCar;const inp={throttle:(keys["KeyW"]?1:0)-(keys["KeyS"]?1:0),steer:(keys["KeyA"]?1:0)-(keys["KeyD"]?1:0),brake:!!keys["Space"],boost:!!(keys["ShiftLeft"]||keys["ShiftRight"])};
   const wasBoost=c.boosting;c.drive(dt,inp,city.colliders);if(c.boosting&&!wasBoost)audio.boost(true);
   audio.setEngine(Math.abs(c.speed)/27,true);
   // desired camera behind car
   let dy=(c.angle+Math.PI)-yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;if(Math.abs(c.speed)>2)yaw+=dy*Math.min(1,dt*2.2);
   if(c.health<=0){player.health-=30;c.health=55;exitCar();toast("Car wrecked!")}
   // reckless / sidewalk
   const onRoad=ROAD_X.some(x=>Math.abs(c.x-x)<9)||ROAD_Z.some(z=>Math.abs(c.z-z)<9)||c.z>175||(Math.abs(c.x-GARAGE_POS.x)<16&&Math.abs(c.z-GARAGE_POS.z)<14);
   if(!onRoad&&Math.abs(c.speed)>11){reckT+=dt;if(reckT>1.2){reckT=0;G.addWanted(1,"reckless sidewalk driving")}}else reckT=Math.max(0,reckT-dt);
   // garage auto-open
   if(Math.hypot(c.x-GARAGE_POS.x,c.z-GARAGE_POS.z)<6.5&&Math.abs(c.speed)<0.6&&garageCd<=0&&!G.garageOpen&&!(G.delivery&&G.delivery.stage==="pickup")){Garage.openGarage(G)}
  }else{player.update(dt,keys,yaw,collideFn,!!(keys["ShiftLeft"]||keys["ShiftRight"]));audio.setEngine(0,false)}
  G.health=player.health;
  // missions / side jobs
  M.updateMission(G,dt);M.updateTaxi(G,dt);M.updateDelivery(G,dt);
  if(G.mission.active&&G.mission.index===3)bagMeshes.forEach((b,i)=>b.visible=G.mission.data.bags===i);else bagMeshes.forEach(b=>b.visible=false);
  // conches
  for(let i=0;i<conchList.length;i++){const c=conchList[i];if(c.taken)continue;c.mesh.rotation.y+=dt*2;c.mesh.position.y=0.6+Math.sin(t*3+i)*0.15;const P=G.playerPos;if(Math.hypot(P.x-c.x,P.z-c.z)<3){c.taken=true;c.mesh.visible=false;save.conches.push(i);G.addCash(50);save.stats.conchCash+=50;toast(`🐚 Golden conch ${save.conches.length}/10 — +$50`);audio.pickup();G.persist()}}
  // police
  ensurePolice(police,G,dt);updatePolice(police,dt,G);G.policeCars=police.cars;
  audio.setSiren(G.wanted>0&&police.cars.length>0);
  // wanted decay when unseen
  let seen=false;for(const pc of police.cars)if(Math.hypot(pc.x-G.playerPos.x,pc.z-G.playerPos.z)<38)seen=true;for(const o of police.officers)if(Math.hypot(o.x-G.playerPos.x,o.z-G.playerPos.z)<24)seen=true;
  if(G.wanted>0&&!seen){sightT+=dt;if(sightT>5){sightT=0;G.wanted--;toast(G.wanted?`Heat cooling… ${G.wanted}★`:"Heat lost. You're clear.")}}else sightT=0;
  // busted on foot
  if(!G.inCar&&G.wanted>0){let near=false;for(const pc of police.cars)if(Math.hypot(pc.x-player.x,pc.z-player.z)<4)near=true;for(const o of police.officers)if(Math.hypot(o.x-player.x,o.z-player.z)<2.5)near=true;if(near&&!player.moving)G.bustTimer+=dt;else G.bustTimer=Math.max(0,G.bustTimer-dt)}
  if(G.bustTimer>2){G.bustTimer=0;el("busted").style.display="flex";G.paused=true}
  if(player.health<=0){el("wasted").style.display="flex";G.paused=true;player.health=50 /* prevent re-trigger until respawn */}
  updatePeds(peds,dt,G);updateTraffic(trafficCars,dt);updateBoats(boats,t);combat.update(dt);
  // weather cycle
  rainT-=dt;if(rainT<=0){if(G.weather==="clear"){setWeather("rain");rainT=26}else{setWeather("clear");rainT=80+Math.random()*80}}
  // marker beacon
  if(G.marker){beacon.visible=true;beacon.position.set(G.marker.x,16,G.marker.z);beacon.material.color.set(G.marker.color||"#ffd23f");cpRing.visible=G.mission.active&&G.mission.index===4;if(cpRing.visible)cpRing.position.set(G.marker.x,1,G.marker.z)}else{beacon.visible=false;cpRing.visible=false}
 }
 // weather visuals lerp
 weatherMix+=(((G.weather==="rain")?1:0)-weatherMix)*Math.min(1,dt*0.8);
 scene.fog.color.setHex(0xf2a56b).lerp(new THREE.Color(0x77808a),weatherMix);scene.background.setHex(0xffb37a).lerp(new THREE.Color(0x77808a),weatherMix);domeMat.color.setHex(0xff9e64).lerp(new THREE.Color(0x66707a),weatherMix);sun.intensity=1.5-weatherMix*0.8;wetMats[0].opacity=weatherMix*0.38;
 if(rain.visible){rain.position.set(G.playerPos.x,12,G.playerPos.z);const p=rainGeo.attributes.position.array;for(let i=0;i<p.length;i+=3){p[i+1]-=dt*38;if(p[i+1]<0)p[i+1]=35}rainGeo.attributes.position.needsUpdate=true}
 // camera damped
 const P=G.playerPos;const dist=G.inCar?11:7.5,height=G.inCar?4.2:3.2;
 const fwd={x:-Math.sin(yaw),z:-Math.cos(yaw)};const desired=new THREE.Vector3(P.x-fwd.x*dist,height+Math.sin(pitch)*4,P.z-fwd.z*dist);
 camPos.lerp(desired,1-Math.exp(-dt*5));camera.position.copy(camPos);camera.lookAt(P.x,1.6,P.z);
 if(G.playing){mmT-=dt;if(mmT<=0){mmT=0.12;drawMinimap(el("minimap"),G);updateHUD(G)}}
 renderer.render(scene,camera);
}
requestAnimationFrame(loop);
// ---------- SOLANO test hooks ----------
function stageShot(){
 if(!shot)return;startGame(true);G.playing=true;
 if(shot==="cover"){player.x=4;player.z=-52;yaw=0.15;pitch=0.3;M.startMission(G,0);
  if(peds[10]){peds[10].x=-4;peds[10].z=-60;peds[10].mesh.position.set(-4,0,-60)}if(peds[11]){peds[11].x=6;peds[11].z=-44;peds[11].mesh.position.set(6,0,-44)}
  const truck=trafficCars.find(c=>c.type==="truck");if(truck){truck.x=-2;truck.z=-68;truck.ai={vert:true,dir:1,speed:9,road:0};truck.sync()}}
 if(shot==="chase"){const c=parked[0];c.x=0;c.z=-8;c.angle=Math.PI;c.sync();enterCar(c);yaw=0;pitch=0.75;
  // shot-only staging: player already rolling north up the x=0 canyon, throttle held so the speed holds at capture.
  // High pitch tips the chase cam down so the road behind the player (and the pack on the player's tail) stays in frame:
  // police sit close behind and flanking, already at pursuit speed, and the capture comes early before pursuit drift spreads them.
  c.speed=13;keys["KeyW"]=true;
  for(const tc of trafficCars){if(Math.abs(tc.x)<14&&tc.z>-110&&tc.z<30){tc.x+=120;tc.sync()}} // clear the player's lane ahead/behind
  G.setWanted(5);G.objective="CHASE — Lose 5★ heat! Police are closing in on Juno.";
  const spots=[[-5,3.4],[5,4.4],[-1.8,5.4]];const pack=[];
  for(let i=0;i<spots.length;i++){const pc=new Car(scene,"police",0x1a2a4a,spots[i][0],c.z+spots[i][1],Math.PI);pc.isPolice=true;pc.speed=15;pc.sync();police.cars.push(pc);allCars.push(pc);pack.push(pc)}G.policeCars=police.cars;
  // staging formation keeper: pursuit AI drifts the pack apart within a second of sim time, so re-pin it around the player while the shot is taken
  setInterval(()=>{if(!G.playerCar)return;const p=G.playerCar;pack.forEach((pc,i)=>{pc.x=p.x+spots[i][0];pc.z=p.z+spots[i][1];pc.angle=Math.PI;pc.speed=Math.max(10,p.speed);pc.sync()})},300);
  dialogue("Rosa Delgado","Five stars, Juno — drive!",2000)}
 if(shot==="garage"){save.cash=Math.max(save.cash,900);const c=parked[1];c.x=GARAGE_POS.x;c.z=GARAGE_POS.z+2;c.angle=Math.PI-0.3;c.setColor(0xe8b13a);c.sync();enterCar(c);c.speed=0;G.setWanted(0);yaw=0.38;pitch=0.5;
  // shot-only staging: bright work lights in the bay, lighter backdrop dim, menu shifted left so the car on the pad stays visible beside it.
  // A lot tree stands at (82.6,47.2), just south-west of the pad: this SSE camera angle puts its trunk beside the car, not across it.
  sun.intensity=2.3;scene.add(new THREE.HemisphereLight(0xfff2d8,0x556677,0.9));
  const bay=new THREE.PointLight(0xffd9a0,120,50);bay.position.set(GARAGE_POS.x,5.5,GARAGE_POS.z+1);scene.add(bay);
  const spill=new THREE.PointLight(0xfff6e0,60,32);spill.position.set(GARAGE_POS.x-6,3,GARAGE_POS.z+10);scene.add(spill);
  el("garage").style.background="rgba(0,0,0,0.16)";el("garage").style.justifyContent="flex-start";const card=el("garage").firstElementChild;card.style.marginLeft="30px";card.style.maxWidth="400px";
  titoNpc.position.set(GARAGE_POS.x+4,0,GARAGE_POS.z+4.5);Garage.openGarage(G)}
 if(shot==="mission"){const c=parked[2];c.x=58;c.z=150;c.angle=Math.PI;c.sync();enterCar(c);yaw=0;M.startMission(G,5);G.mission.stage=2;G.mission.data={t:0,bags:0,cp:0,raceT:0,mid:true};G.setWanted(3);G.marker={x:DOCKS_POS.x,z:DOCKS_POS.z,color:"#ffd23f"};G.objective="M6 The Palmera Job (2/3): Drive the sealed package to Ilya at the marina docks — heat is rising.";dialogue("Rosa Delgado","Sealed and heavy. Marina, Juno. Whatever happens, deliver it.",9000)}
}
stageShot();
window.SOLANO={get state(){return{cash:save.cash,wanted:G.wanted,mission:{index:G.mission.index,stage:G.mission.stage,active:G.mission.active,next:save.mission},position:{...G.playerPos},weather:G.weather,inCar:G.inCar,health:player.health,garageOpen:G.garageOpen,taxi:!!G.taxi,delivery:!!G.delivery,conches:save.conches.length,raceBest:save.raceBest,pistol:save.pistol,car:G.playerCar?{id:G.playerCar.id,color:G.playerCar.color,health:G.playerCar.health,build:{...G.playerCar.build}}:null}},
 setWanted:n=>G.setWanted(n),teleport:(x,z)=>{if(G.inCar&&G.playerCar){G.playerCar.x=x;G.playerCar.z=z;G.playerCar.sync()}else{player.x=x;player.z=z}},
 startMission:n=>M.startMission(G,n),startTaxi:()=>M.startTaxi(G),startRace:()=>M.startRace(G),startDelivery:()=>M.startDelivery(G),
 openGarage:()=>Garage.openGarage(G),buyRespray:i=>Garage.buyRespray(G,i),buyEngine:()=>Garage.buyEngine(G),buyArmour:()=>Garage.buyArmour(G),buyNitro:()=>Garage.buyNitro(G),
 garageState:()=>G.playerCar?{...G.playerCar.build}:null,setWeather:w=>setWeather(w==="rain"?"rain":"clear"),
 enterNearest:()=>enterCar(nearestCar()),exitCar:()=>exitCar(),start:cont=>startGame(cont!==false),save:()=>G.persist(),load:()=>{save=loadSave();G.save=save},
 addCash:n=>G.addCash(n),damage:n=>{player.health-=n},keys};
