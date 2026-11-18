// localStorage save: cash, story, conches, best race, garage builds, stats.
const KEY="solano-heat-gh2-save-v1";
export function defaultSave(){return{cash:350,mission:0,pistol:false,conches:[],raceBest:0,garage:{},stats:{taxi:0,taxiEarn:0,deliveries:0,streak:0,fares:0,conchCash:0},health:100}}
export function loadSave(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s.cash==="number"){const d=defaultSave();return{...d,...s,stats:{...d.stats,...(s.stats||{})},garage:s.garage||{},conches:s.conches||[]}}}catch(e){}return defaultSave()}
export function storeSave(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
export function clearSave(){try{localStorage.removeItem(KEY)}catch(e){}}
