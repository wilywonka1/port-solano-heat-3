// DOM HUD helpers: toasts, dialogue, objective, fanfare.
import {fmt$} from "./config.js";
export function el(id){return document.getElementById(id)}
export function toast(msg,ms=2600){const t=el("toast");t.textContent=msg;t.style.opacity=1;clearTimeout(t._h);t._h=setTimeout(()=>t.style.opacity=0,ms)}
export function dialogue(who,text,ms=4200){const d=el("dialogue");el("dlg-who").textContent=who;el("dlg-text").textContent=text;d.style.display="block";clearTimeout(d._h);if(ms)d._h=setTimeout(()=>d.style.display="none",ms)}
export function hideDialogue(){el("dialogue").style.display="none"}
export function fanfare(title,reward,total,audio){el("fanfare-title").textContent=title;el("fanfare-sub").textContent=`Reward ${fmt$(reward)}  •  Cash ${fmt$(total)}`;el("fanfare").style.display="flex";audio&&audio.fanfare();setTimeout(()=>el("fanfare").style.display="none",3400)}
export function updateHUD(G){
 el("hud-cash").textContent=fmt$(G.save.cash);
 el("hud-health").style.width=Math.max(0,G.health)+"%";
 el("hud-stars").textContent="★".repeat(G.wanted)+"☆".repeat(5-G.wanted);
 el("hud-stars").style.color=G.wanted?"#ffd23f":"#666";
 el("hud-weapon").textContent=G.inCar?"—":(G.weapon==="pistol"?`PISTOL ${G.combat.ammo} / ∞${G.combat.reloading>0?" (reloading…)":""}`:"FISTS  (F punch"+(G.save.pistol?", click pistol)":")"));
 el("hud-speed").textContent=G.inCar?Math.round(Math.abs(G.playerCar.speed)*3.6)+" km/h":"";
 el("hud-objective").textContent=G.objective||"Free roam — find Rosa, take fares, deliveries, or explore Port Solano.";
 if(G.timerText){el("hud-timer").style.display="block";el("hud-timertext").textContent=G.timerText;if(G.timerFrac!==undefined)el("hud-timerbar").style.width=Math.max(0,G.timerFrac*100)+"%"}else el("hud-timer").style.display="none";
 el("hud-conches").textContent=`🐚 ${G.save.conches.length}/10   Taxi ${fmt$(G.save.stats.taxiEarn)}   Streak ${G.save.stats.streak||0}`;
}
