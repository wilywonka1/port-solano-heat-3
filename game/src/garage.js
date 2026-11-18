// Tito's Garage: respray / engine / armour / nitro. Purchases persist per car id in the save.
import {RESPRAY,fmt$} from "./config.js";
import {el,toast,dialogue} from "./hud.js";
export function garageStateFor(G,car){if(!car)return null;let s=G.save.garage[car.id];if(!s){s={color:car.color,engine:false,armour:false,nitro:false};G.save.garage[car.id]=s}car.build=s;car.setColor(s.color);return s}
export function applyBuild(car){if(!car)return;const s=car.build;if(s&&s.color!==undefined)car.mesh.userData.paint.color.setHex(s.color)}
export function openGarage(G){if(!G.inCar||!G.playerCar){toast("Drive a car onto Tito's pad first.");return false}
 garageStateFor(G,G.playerCar);G.garageOpen=true;G.paused=true;renderGarage(G);el("garage").style.display="flex";dialogue("Tito Marlin","Welcome to Tito's. Pick a job — cash up front, quality always.",5000);return true}
export function closeGarage(G){G.garageOpen=false;G.paused=false;el("garage").style.display="none"}
export function renderGarage(G){const car=G.playerCar,s=car?garageStateFor(G,car):null;if(!s)return;
 el("garage-cash").textContent=`Cash ${fmt$(G.save.cash)}  •  This car: ${s.engine?"Engine ✓ ":""}${s.armour?"Armour ✓ ":""}${s.nitro?"Nitro ✓ ":""}${(!s.engine&&!s.armour&&!s.nitro)?"stock":""}`;
 el("respray-row").innerHTML=RESPRAY.map((r,i)=>`<button data-respray="${i}" style="background:#${r.c.toString(16).padStart(6,"0")};color:#fff;border:2px solid ${s.color===r.c?"#fff":"#333"};padding:8px;border-radius:6px;cursor:pointer">${r.n} $100</button>`).join("");
 el("btn-engine").textContent=s.engine?"Engine Tuning ✓ Owned":"Engine Tuning — $400";
 el("btn-armour").textContent=s.armour?"Armour Plating ✓ Owned":"Armour Plating — $350";
 el("btn-nitro").textContent=s.nitro?"Nitro ✓ Owned (hold Shift)":"Nitro — $500";
 document.querySelectorAll("[data-respray]").forEach(b=>b.onclick=()=>buyRespray(G,+b.dataset.respray));
 el("btn-engine").onclick=()=>buyEngine(G);el("btn-armour").onclick=()=>buyArmour(G);el("btn-nitro").onclick=()=>buyNitro(G);el("btn-garage-close").onclick=()=>closeGarage(G);
}
function pay(G,amt,owned){if(owned){dialogue("Tito Marlin","Already on the car, Juno. No charge.");return false}if(G.save.cash<amt){G.audio.denied();dialogue("Tito Marlin","Not enough cash for that one. Run a fare or a delivery, then come back.");return false}G.save.cash-=amt;G.audio.jingle();G.persist();return true}
export function buyRespray(G,i){const car=G.playerCar;if(!car)return false;const s=garageStateFor(G,car);if(s.color===RESPRAY[i].c){dialogue("Tito Marlin","Same colour as now — on the house.");return true}if(!pay(G,100,false))return false;s.color=RESPRAY[i].c;car.setColor(RESPRAY[i].c);dialogue("Tito Marlin",`Fresh ${RESPRAY[i].n}. She looks brand new.`);G.persist();renderGarage(G);return true}
export function buyEngine(G){const car=G.playerCar;if(!car)return false;const s=garageStateFor(G,car);if(!pay(G,400,s.engine))return false;s.engine=true;dialogue("Tito Marlin","Tuned. You'll feel it off the line.");G.persist();renderGarage(G);return true}
export function buyArmour(G){const car=G.playerCar;if(!car)return false;const s=garageStateFor(G,car);if(!pay(G,350,s.armour))return false;s.armour=true;dialogue("Tito Marlin","Plated. Police taps won't hurt like before.");G.persist();renderGarage(G);return true}
export function buyNitro(G){const car=G.playerCar;if(!car)return false;const s=garageStateFor(G,car);if(!pay(G,500,s.nitro))return false;s.nitro=true;dialogue("Tito Marlin","Nitro fitted. Hold Shift and hold on.");G.persist();renderGarage(G);return true}
