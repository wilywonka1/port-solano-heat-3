// Live canvas minimap with distinct blip colours (legend is on the pause screen).
import {ROAD_X,ROAD_Z,WORLD,GARAGE_POS} from "./config.js";
export function drawMinimap(canvas,G){
 const c=canvas.getContext("2d"),W=canvas.width,H=canvas.height;c.clearRect(0,0,W,H);
 c.fillStyle="#20303a";c.fillRect(0,0,W,H);
 const sx=x=>(x-WORLD.minX)/(WORLD.maxX-WORLD.minX)*W,sz=z=>(z-WORLD.minZ)/(WORLD.maxZ-WORLD.minZ)*H;
 c.fillStyle="#d8cf8f";c.fillRect(0,sz(185),W,sz(225)-sz(185));c.fillStyle="#2e7fa8";c.fillRect(0,sz(225),W,H-sz(225));
 c.strokeStyle="#555c63";c.lineWidth=3;for(const x of ROAD_X){c.beginPath();c.moveTo(sx(x),0);c.lineTo(sx(x),sz(185));c.stroke()}for(const z of ROAD_Z){c.beginPath();c.moveTo(0,sz(z));c.lineTo(W,sz(z));c.stroke()}
 function dot(x,z,col,r=3){c.fillStyle=col;c.beginPath();c.arc(sx(x),sz(z),r,0,6.29);c.fill()}
 for(const cc of G.conches||[])if(!cc.taken)dot(cc.x,cc.z,"#fff3b0",2);
 for(const car of G.trafficCars||[])dot(car.x,car.z,"#9aa0a6",2);
 if(G.taxiPed)dot(G.taxiPed.x,G.taxiPed.z,"#2ecc71",4);
 if(G.marker)dot(G.marker.x,G.marker.z,G.marker.color||"#ffd23f",5);
 dot(GARAGE_POS.x,GARAGE_POS.z,"#ff9f1a",4);c.fillStyle="#fff";c.font="8px sans-serif";c.fillText("🔧",sx(GARAGE_POS.x)-5,sz(GARAGE_POS.z)+3);
 const flash=Math.floor(performance.now()/300)%2===0;
 for(const pc of G.policeCars||[])dot(pc.x,pc.z,flash?"#3388ff":"#ff3344",4);
 // player arrow
 const px=sx(G.playerPos.x),pz=sz(G.playerPos.z),a=G.playerAngle;c.save();c.translate(px,pz);c.rotate(-a);c.fillStyle="#fff";c.beginPath();c.moveTo(0,-7);c.lineTo(5,5);c.lineTo(-5,5);c.closePath();c.fill();c.restore();
}
