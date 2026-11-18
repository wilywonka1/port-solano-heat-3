// Punch and pistol: hitscan tracer, muzzle flash, magazine/reload, NPC health.
export function createCombat(scene){const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(6),3));
 const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffe27a}));line.visible=false;scene.add(line);
 const flash=new THREE.PointLight(0xffcc66,0,9);scene.add(flash);
 return{timer:0,ammo:12,mag:12,reloading:0,line,flash,
  update(dt){if(this.timer>0){this.timer-=dt;if(this.timer<=0){this.line.visible=false;this.flash.intensity=0}}if(this.reloading>0){this.reloading-=dt;if(this.reloading<=0)this.ammo=this.mag}},
  shoot(G,origin,dir){if(this.reloading>0)return false;if(this.ammo<=0){this.reloading=1.1;G.audio.denied();return false}
   this.ammo--;G.audio.shoot();let best=60,bestPed=null,bestOff=null;
   for(const p of G.peds){if(p.state==="down")continue;const to={x:p.x-origin.x,z:p.z-origin.z};const t=to.x*dir.x+to.z*dir.z;if(t>0&&t<best){const px=origin.x+dir.x*t,pz=origin.z+dir.z*t;if(Math.hypot(p.x-px,p.z-pz)<0.9){best=t;bestPed=p}}}
   for(const o of G.police.officers){const to={x:o.x-origin.x,z:o.z-origin.z};const t=to.x*dir.x+to.z*dir.z;if(t>0&&t<best){const px=origin.x+dir.x*t,pz=origin.z+dir.z*t;if(Math.hypot(o.x-px,o.z-pz)<0.9){best=t;bestPed=null;bestOff=o}}}
   const end={x:origin.x+dir.x*best,z:origin.z+dir.z*best};
   const pos=this.line.geometry.attributes.position.array;pos[0]=origin.x;pos[1]=1.35;pos[2]=origin.z;pos[3]=end.x;pos[4]=1.2;pos[5]=end.z;this.line.geometry.attributes.position.needsUpdate=true;this.line.visible=true;this.timer=0.09;this.flash.position.set(origin.x,1.5,origin.z);this.flash.intensity=2.4;
   if(bestPed){bestPed.health-=34;if(bestPed.health<=0){bestPed.state="down";bestPed.fall=5}G.addWanted(1,"assault")}
   if(bestOff){bestOff.health-=34;G.addWanted(1,"assault")}
   if(this.ammo===0)this.reloading=1.1;
   return true},
  punch(G){G.audio.punch();let hit=false;for(const p of G.peds){if(Math.hypot(p.x-G.player.x,p.z-G.player.z)<1.7){p.health-=16;hit=true;if(p.health<=0){p.state="down";p.fall=4}else p.state="flee"}}if(hit)G.addWanted(1,"assault");return hit}
 }}
