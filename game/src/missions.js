// Story missions M1-M6, taxi fares, Harbour Run race, Marlin Freight deliveries.
import {ROSA_POS,HOTEL_POS,MARINA_POS,DOCKS_POS,GARAGE_POS,CHECKPOINTS,ROAD_X,ROAD_Z,fmt$} from "./config.js";
export const MISSION_NAMES=["M1 Courier Run","M2 Timed Delivery","M3 Lose the Heat","M4 Marina Score","M5 Harbour Run","M6 The Palmera Job"];
const BAG_POS=[[105,245],[130,255],[155,245],[105,275],[170,270]];
export function missionState(G){return G.mission}
export function startMission(G,n){
 if(n===undefined)n=G.save.mission;if(n>5){G.toast("Story complete — free roam, races, fares and deliveries continue.");return false}
 G.mission={index:n,active:true,stage:0,data:{t:0,bags:0,cp:0,raceT:0}};G.save.mission=Math.max(G.save.mission,n);
 if(n===0){G.mission.stage=1;G.marker={...ROSA_POS,color:"#ffd23f"};G.objective="M1 Courier Run: Meet Rosa Delgado at the gold marker.";G.dialogue("Rosa Delgado","Juno — Café corner, gold marker. I have a package that needs legs.",5000)}
 if(n===1){G.mission.stage=1;G.mission.data.t=95;G.marker={...HOTEL_POS,color:"#ffd23f"};G.objective="M2 Timed Delivery: Get Rosa's parcel to Hotel Palmera before time runs out.";G.dialogue("Rosa Delgado","Hotel Palmera, fast. Do this clean and I'll sort you a pistol.",5000)}
 if(n===2){G.setWanted(3);G.mission.stage=1;G.marker=null;G.objective="M3 Lose the Heat: Break police line of sight and let 3 stars cool off.";G.dialogue("Rosa Delgado","Heat's on you now, Juno. Lose them — alleys, distance, patience.",5000)}
 if(n===3){G.mission.stage=1;G.setWanted(2);G.marker={x:BAG_POS[0][0],z:BAG_POS[0][1],color:"#ffd23f"};G.objective="M4 Marina Score: Steal cash bag 1 of 5 at the marina.";G.dialogue("Cpt. Ilya Sorin","Five cash bags on my docks, Juno. Take them — if you can outrun the response.",5000)}
 if(n===4){return startRace(G)}
 if(n===5){G.mission.stage=1;G.marker={...HOTEL_POS,color:"#ffd23f"};G.objective="M6 The Palmera Job (1/3): Collect the sealed package from Rosa at Hotel Palmera.";G.dialogue("Rosa Delgado","Final job, Juno. Hotel Palmera — I hand you a sealed package. Don't open it.",6000)}
 G.persist();return true;
}
export function completeMission(G,reward){const idx=G.mission.index;G.addCash(reward);G.save.mission=idx+1;G.mission={index:idx+1,active:false,stage:0,data:{}};G.marker=null;G.fanfare(MISSION_NAMES[idx]+" Complete",reward);G.persist();
 if(idx===5){G.storyComplete()}}
export function updateMission(G,dt){
 const m=G.mission;if(!m||!m.active)return;const P=G.playerPos;
 const near=(t,r=6)=>Math.hypot(P.x-t.x,P.z-t.z)<r;
 if(m.index===0){if(m.stage===1&&near(ROSA_POS,7)){m.stage=2;G.marker={...MARINA_POS,color:"#ffd23f"};G.objective="M1: Take Rosa's package to the marina (gold marker).";G.dialogue("Rosa Delgado","Package in hand. Marina, to Ilya — no detours.",4500)}
  else if(m.stage===2&&near(MARINA_POS,8)){G.dialogue("Cpt. Ilya Sorin","On time. Rosa chose well.");completeMission(G,250)}}
 if(m.index===1){m.data.t-=dt;G.timerText=`⏱ Delivery ${Math.max(0,Math.ceil(m.data.t))}s`;G.timerFrac=m.data.t/95;if(m.data.t<=0){G.toast("Too late — M2 failed. Restart it from Rosa.");m.active=false;G.marker=null;G.timerText=null}
  else if(near(HOTEL_POS,9)){G.timerText=null;G.save.pistol=true;G.toast("Pistol unlocked! Click to shoot, R reloads.");completeMission(G,400)}}
 if(m.index===2){if(G.wanted===0)completeMission(G,600);else G.objective=`M3 Lose the Heat: Stay out of sight — ${G.wanted}★ still on you.`}
 if(m.index===3){const b=BAG_POS[m.data.bags];if(b&&near({x:b[0],z:b[1]},6)){m.data.bags++;G.audio.pickup();G.toast(`Cash bag ${m.data.bags}/5`);if(m.data.bags>=5)completeMission(G,1200);else G.marker={x:BAG_POS[m.data.bags][0],z:BAG_POS[m.data.bags][1],color:"#ffd23f"};if(m.active)G.objective=`M4 Marina Score: Steal cash bag ${m.data.bags+1} of 5.`}}
 if(m.index===4){m.data.raceT+=dt;const cp=CHECKPOINTS[m.data.cp];G.timerText=`🏁 Harbour Run ${m.data.raceT.toFixed(1)}s — checkpoint ${Math.min(8,m.data.cp+1)}/8`;G.timerFrac=m.data.cp/8;
  if(cp&&near({x:cp[0],z:cp[1]},10)){m.data.cp++;G.audio.pickup();G.toast(`Checkpoint ${m.data.cp}/8`);if(m.data.cp>=8){const t=m.data.raceT;G.timerText=null;if(!G.save.raceBest||t<G.save.raceBest)G.save.raceBest=t;completeMission(G,500);G.toast(`Harbour Run finished in ${t.toFixed(1)}s — best ${G.save.raceBest.toFixed(1)}s`)}else G.marker={x:CHECKPOINTS[m.data.cp][0],z:CHECKPOINTS[m.data.cp][1],color:"#ff8c1a"}}}
 if(m.index===5){if(m.stage===1&&near(HOTEL_POS,9)){m.stage=2;G.setWanted(2);G.marker={...DOCKS_POS,color:"#ffd23f"};G.objective="M6 (2/3): Drive the sealed package to Ilya at the marina docks — heat is rising.";G.dialogue("Rosa Delgado","Sealed and heavy. Marina, Juno. Whatever happens, deliver it.",5500)}
  else if(m.stage===2){if(!m.data.mid&&P.z>80){m.data.mid=true;G.setWanted(3);G.toast("Heat escalates — 3 stars!");G.dialogue("Juno Vale","They knew the route. Keep driving.",3500)}
   if(!m.data.late&&P.z>190){m.data.late=true;G.setWanted(4);G.toast("Heat escalates — 4 stars near the drop!")}
   if(near(DOCKS_POS,9)){m.stage=3;G.marker={...DOCKS_POS,color:"#ffd23f"};G.objective="M6 (3/3): Hand the package to Cpt. Ilya Sorin at the docks.";G.dialogue("Cpt. Ilya Sorin","Juno! Over here — hand it over, quickly!",4500);completeMission(G,1500)}}
 }
}
export function startRace(G){G.mission={index:4,active:true,stage:1,data:{t:0,bags:0,cp:0,raceT:0}};G.marker={x:CHECKPOINTS[0][0],z:CHECKPOINTS[0][1],color:"#ff8c1a"};G.objective="M5 Harbour Run: Hit 8 checkpoints — marina → beachfront → downtown.";G.dialogue("Rosa Delgado","Harbour Run, Juno. Eight lights, one city. Go!",4000);return true}
export function startTaxi(G){
 if(G.taxi){G.toast("Taxi fare already active.");return false}
 let best=null,bd=1e9;for(const p of G.peds){if(p.state!=="walk")continue;const d=Math.hypot(p.x-G.playerPos.x,p.z-G.playerPos.z);if(d<bd){bd=d;best=p}}
 if(!best){G.toast("No passenger nearby.");return false}
 best.taxi=true;G.taxi={ped:best,state:"pickup",dest:null,dist:0};G.taxiPed=best;G.marker={x:best.x,z:best.z,color:"#2ecc71"};G.objective="Taxi: Pick up the passenger at the green marker (be in a car).";G.toast("🚕 A passenger is hailing you — green marker.");return true;
}
export function updateTaxi(G,dt){
 const t=G.taxi;if(!t)return;const P=G.playerPos;
 if(t.state==="pickup"){G.marker={x:t.ped.x,z:t.ped.z,color:"#2ecc71"};if(G.inCar&&Math.hypot(P.x-t.ped.x,P.z-t.ped.z)<4){t.ped.state="inTaxi";t.ped.mesh.visible=false;
   const dx=ROAD_X[Math.floor(Math.random()*ROAD_X.length)],dz=ROAD_Z[Math.floor(Math.random()*ROAD_Z.length)];t.dest={x:dx+9,z:dz};t.dist=Math.max(60,Math.hypot(t.dest.x-P.x,t.dest.z-P.z));t.state="drive";G.marker={...t.dest,color:"#2ecc71"};G.objective="Taxi: Drive your passenger to the green destination marker.";G.dialogue("Passenger","Thanks! Across town, please — fast if you can.",3000)}}
 else if(t.state==="drive"){if(Math.hypot(P.x-t.dest.x,P.z-t.dest.z)<7){const fare=Math.round(35+t.dist*0.9+Math.random()*20);G.addCash(fare);G.save.stats.taxi++;G.save.stats.taxiEarn+=fare;G.save.stats.fares++;t.ped.state="walk";t.ped.mesh.visible=true;t.ped.x=t.dest.x;t.ped.z=t.dest.z;t.ped.taxi=false;G.taxi=null;G.taxiPed=null;G.marker=null;G.objective="Fare paid! Find another green hail or take a mission.";G.toast(`🚕 Fare paid ${fmt$(fare)} (incl. tip)`);G.audio.cash();G.persist()}}
}
export function startDelivery(G){
 if(G.delivery){G.toast("Delivery already active.");return false}
 const pickup=Math.random()>0.5?{...GARAGE_POS}:{...MARINA_POS};G.delivery={stage:"pickup",pickup,dest:null,t:0,total:80};
 G.marker={...pickup,color:"#b26bff"};G.objective="Marlin Freight: Collect the parcel at the purple marker (Tito's / marina).";G.toast("📦 Marlin Freight job — purple marker.");return true;
}
export function updateDelivery(G,dt){
 const d=G.delivery;if(!d)return;const P=G.playerPos;
 if(d.stage==="pickup"){if(Math.hypot(P.x-d.pickup.x,P.z-d.pickup.z)<8){const dx=ROAD_X[Math.floor(Math.random()*ROAD_X.length)],dz=ROAD_Z[Math.floor(Math.random()*ROAD_Z.length)];d.dest={x:dx-9,z:dz+4};d.stage="deliver";d.t=d.total;G.marker={...d.dest,color:"#b26bff"};G.objective="Marlin Freight: Deliver the parcel before the purple timer runs out.";G.audio.pickup();G.toast("Parcel collected — timer started!")}}
 else{d.t-=dt;G.timerText=`📦 Delivery ${Math.max(0,Math.ceil(d.t))}s  •  Streak ${G.save.stats.streak||0}`;G.timerFrac=Math.max(0,d.t/d.total);
  if(Math.hypot(P.x-d.dest.x,P.z-d.dest.z)<8){let pay,late=d.t<=0;if(late){pay=30;G.save.stats.streak=0;G.toast(`Late delivery — consolation ${fmt$(pay)}`)}else{pay=Math.round(120+d.t*2+(G.save.stats.streak||0)*20);G.save.stats.streak=(G.save.stats.streak||0)+1;G.toast(`📦 Delivered on time! ${fmt$(pay)} (streak ${G.save.stats.streak})`)}
   G.addCash(pay);G.save.stats.deliveries++;G.delivery=null;G.marker=null;G.timerText=null;G.audio.cash();G.persist()}}
}
