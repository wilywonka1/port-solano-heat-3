// Port Solano: grid city, beach, marina, dressing. Static geometry, canvas facades.
import {ROAD_X,ROAD_Z,BEACH_Z,WATER_Z,GARAGE_POS,HOTEL_POS,SHOP_NAMES,mulberry} from "./config.js";
function canvasTex(w,h,draw){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);return t}
function facadeTex(rng,hue,tall){return canvasTex(128,256,(g,w,h)=>{g.fillStyle=`hsl(${hue},${28+rng()*20}%,${tall?38:52}%)`;g.fillRect(0,0,w,h);for(let y=10;y<h-10;y+=22)for(let x=8;x<w-8;x+=20){const lit=rng()>0.45;g.fillStyle=lit?"#ffd98a":"#263645";g.fillRect(x,y,12,14)}g.fillStyle="rgba(0,0,0,.25)";g.fillRect(0,h-28,w,28)})}
function signTex(name,color){return canvasTex(256,48,(g,w,h)=>{g.fillStyle=color;g.fillRect(0,0,w,h);g.fillStyle="#fff";g.font="bold 22px sans-serif";g.textAlign="center";g.fillText(name,w/2,32)})}
function roadTex(){return canvasTex(64,64,(g,w,h)=>{g.fillStyle="#33373d";g.fillRect(0,0,w,h);g.fillStyle="#e8c85a";g.fillRect(w/2-1,4,2,18);g.fillRect(w/2-1,42,2,18)})}
export function buildCity(scene,rng){
 const colliders=[],group=new THREE.Group();scene.add(group);
 const mats={grass:new THREE.MeshLambertMaterial({color:0x6f9e57}),sand:new THREE.MeshLambertMaterial({color:0xe8cf8f}),water:new THREE.MeshLambertMaterial({color:0x2e7fa8}),side:new THREE.MeshLambertMaterial({color:0xbdb6a6}),road:new THREE.MeshLambertMaterial({map:roadTex()}),white:new THREE.MeshLambertMaterial({color:0xf5f0e6})};
 mats.road.map.wrapS=mats.road.map.wrapT=THREE.RepeatWrapping;
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(520,560),mats.grass);ground.rotation.x=-Math.PI/2;ground.position.set(0,-0.05,55);group.add(ground);
 const sand=new THREE.Mesh(new THREE.PlaneGeometry(520,55),mats.sand);sand.rotation.x=-Math.PI/2;sand.position.set(0,0.01,BEACH_Z+22);group.add(sand);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(560,180),mats.water);water.rotation.x=-Math.PI/2;water.position.set(0,0.02,WATER_Z+85);group.add(water);
 // roads
 for(const x of ROAD_X){const r=new THREE.Mesh(new THREE.PlaneGeometry(14,400),mats.road.clone());r.material.map=mats.road.map.clone();r.material.map.repeat.set(1,28);r.material.map.needsUpdate=true;r.rotation.x=-Math.PI/2;r.position.set(x,0.03,-10);group.add(r)}
 for(const z of ROAD_Z){const r=new THREE.Mesh(new THREE.PlaneGeometry(440,14),mats.road.clone());r.material.map=mats.road.map.clone();r.material.map.repeat.set(28,1);r.rotation.x=-Math.PI/2;r.rotation.z=Math.PI/2;r.position.set(0,0.03,z);group.add(r)}
 const beachPath=new THREE.Mesh(new THREE.PlaneGeometry(440,6),mats.side);beachPath.rotation.x=-Math.PI/2;beachPath.position.set(0,0.04,198);group.add(beachPath);
 // buildings per block
 const facades=[];for(let i=0;i<10;i++)facades.push(new THREE.MeshLambertMaterial({map:facadeTex(rng,18+rng()*40,i<4)}));
 let shopIdx=0;
 const shopColors=["#b33a2b","#20608a","#2e7d4f","#7a3b8a","#c07a1a","#28536b"];
 for(let bi=0;bi<ROAD_X.length-1;bi++)for(let bj=0;bj<ROAD_Z.length-1;bj++){
  const cx=(ROAD_X[bi]+ROAD_X[bi+1])/2,cz=(ROAD_Z[bj]+ROAD_Z[bj+1])/2;
  if(cx===90&&cz===50)continue; // Tito's lot stays open for the garage
  const downtown=Math.abs(cx)<130&&cz<40; const hBase=downtown?26+rng()*38:9+rng()*10;
  for(let k=0;k<4;k++){const ox=(k%2?13:-13),oz=(k<2?13:-13);const w=20,d=20,h=hBase*(0.7+rng()*0.6);
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),facades[Math.floor(rng()*facades.length)]);b.position.set(cx+ox,h/2,cz+oz);group.add(b);colliders.push({x:cx+ox,z:cz+oz,w:w+2,d:d+2});
   if(k===0&&rng()>0.25){ // shopfront on south face
    const name=SHOP_NAMES[shopIdx++%SHOP_NAMES.length];
    const awn=new THREE.Mesh(new THREE.BoxGeometry(16,0.4,4),new THREE.MeshLambertMaterial({color:shopColors[shopIdx%shopColors.length]}));awn.position.set(cx+ox,3.4,cz+oz+12);group.add(awn);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(15,2.8),new THREE.MeshBasicMaterial({map:signTex(name,shopColors[shopIdx%shopColors.length])}));sign.position.set(cx+ox,5.2,cz+oz+10.2);group.add(sign);
   }
  }
 }
 // skyline silhouette ring
 const skyMat=new THREE.MeshBasicMaterial({color:0x8a5a6a});
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r=330;const h=30+((i*37)%60);const b=new THREE.Mesh(new THREE.BoxGeometry(28,h,28),skyMat);b.position.set(Math.cos(a)*r,h/2-2,Math.sin(a)*r+40);group.add(b)}
 // trees: instanced trunks+canopy approximated by merged cones/cylinders as two instanced meshes
 const trunkG=new THREE.CylinderGeometry(0.3,0.4,3,5),leafG=new THREE.SphereGeometry(2.2,7,6);
 const trunks=new THREE.InstancedMesh(trunkG,new THREE.MeshLambertMaterial({color:0x7a5230}),90);
 const leaves=new THREE.InstancedMesh(leafG,new THREE.MeshLambertMaterial({color:0x3e7d32}),90);
 const m4=new THREE.Matrix4();let ti=0;
 for(let i=0;i<90;i++){const x=-210+rng()*420,z=-190+rng()*370;if(ROAD_X.some(r=>Math.abs(x-r)<10)||ROAD_Z.some(r=>Math.abs(z-r)<10))continue;if(z>BEACH_Z)continue;m4.makeTranslation(x,1.5,z);trunks.setMatrixAt(ti,m4);m4.makeTranslation(x,4.5,z);leaves.setMatrixAt(ti,m4);ti++}
 trunks.count=leaves.count=ti;group.add(trunks,leaves);
 // streetlights
 const poleG=new THREE.CylinderGeometry(0.12,0.12,6,5),lampG=new THREE.SphereGeometry(0.35,6,5);
 const poles=new THREE.InstancedMesh(poleG,new THREE.MeshLambertMaterial({color:0x333333}),60),lamps=new THREE.InstancedMesh(lampG,new THREE.MeshBasicMaterial({color:0xffd98a}),60);let li=0;
 for(const x of ROAD_X)for(const z of ROAD_Z){if(li>=60)break;m4.makeTranslation(x+8,3,z+8);poles.setMatrixAt(li,m4);m4.makeTranslation(x+8,6.1,z+8);lamps.setMatrixAt(li,m4);li++}
 poles.count=lamps.count=li;group.add(poles,lamps);
 // small props: benches, hydrants, bus stops, billboards, beach gear
 const benchMat=new THREE.MeshLambertMaterial({color:0x6b4a2a});
 for(let i=0;i<24;i++){const x=-200+rng()*400,z=-180+rng()*360;if(ROAD_X.some(r=>Math.abs(x-r)<9))continue;const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.5,0.8),benchMat);b.position.set(x,0.5,z);group.add(b)}
 for(let i=0;i<10;i++){const x=-180+i*40,z=193;const u=new THREE.Mesh(new THREE.ConeGeometry(1.6,1.2,8),new THREE.MeshLambertMaterial({color:[0xe74c3c,0x3498db,0xf1c40f,0xe67e22][i%4]}));u.position.set(x,1.4,z+((i*13)%18));group.add(u);const t=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.2),new THREE.MeshLambertMaterial({color:0xffffff}));t.rotation.x=-Math.PI/2;t.position.set(x,0.06,z+2);group.add(t)}
 for(let i=0;i<5;i++){const bb=new THREE.Mesh(new THREE.PlaneGeometry(14,5),new THREE.MeshBasicMaterial({map:signTex(["VISIT PORT SOLANO","SOLANO HEAT","MARINA MOTORS","PALMERA HOTEL","MARLIN FREIGHT"][i],"#402050")}));bb.position.set(-160+i*80,9,-196);group.add(bb);const p=new THREE.Mesh(new THREE.BoxGeometry(0.4,9,0.4),benchMat);p.position.set(-160+i*80,4.5,-196.3);group.add(p)}
 // marina docks
 const dockMat=new THREE.MeshLambertMaterial({color:0x8a6a44});
 for(let i=0;i<4;i++){const d=new THREE.Mesh(new THREE.BoxGeometry(4,0.6,55),dockMat);d.position.set(95+i*28,0.4,255);group.add(d);colliders.push({x:95+i*28,z:235,w:5,d:6})}
 // garage building: open front bay, lift, neon sign
 const gar=new THREE.Group();gar.position.set(GARAGE_POS.x,0,GARAGE_POS.z);
 const gw=new THREE.MeshLambertMaterial({color:0xd8cfb8}),gd=new THREE.MeshLambertMaterial({color:0x37474f});
 const back=new THREE.Mesh(new THREE.BoxGeometry(26,7,1),gw);back.position.set(0,3.5,-10);gar.add(back);
 const sideL=new THREE.Mesh(new THREE.BoxGeometry(1,7,20),gw);sideL.position.set(-13,3.5,0);gar.add(sideL);
 const sideR=sideL.clone();sideR.position.x=13;gar.add(sideR);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(27,0.6,21),gd);roof.position.set(0,7.2,0);gar.add(roof);
 const lift=new THREE.Mesh(new THREE.BoxGeometry(5,0.4,9),new THREE.MeshLambertMaterial({color:0xc9a227}));lift.position.set(0,0.25,2);gar.add(lift);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(16,3),new THREE.MeshBasicMaterial({map:signTex("TITO'S GARAGE","#102a3a")}));sign.position.set(0,8.6,10.6);gar.add(sign);
 const neon=new THREE.Mesh(new THREE.PlaneGeometry(10,2),new THREE.MeshBasicMaterial({map:signTex("TITO'S","#ff2d78")}));neon.position.set(0,4.5,-9.4);gar.add(neon);
 const pad=new THREE.Mesh(new THREE.PlaneGeometry(7,11),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:0.35}));pad.rotation.x=-Math.PI/2;pad.position.set(0,0.08,2);gar.add(pad);
 group.add(gar);colliders.push({x:GARAGE_POS.x-13,z:GARAGE_POS.z,w:2,d:20},{x:GARAGE_POS.x+13,z:GARAGE_POS.z,w:2,d:20},{x:GARAGE_POS.x,z:GARAGE_POS.z-10,w:26,d:2});
 // hotel marker building sign
 const hs=new THREE.Mesh(new THREE.PlaneGeometry(18,3.4),new THREE.MeshBasicMaterial({map:signTex("HOTEL PALMERA","#5a2a6a")}));hs.position.set(-77,13,-46.7);group.add(hs);
 return{colliders,group,waterMat:mats.water,roadMats:group};
}
export function collide(colliders,x,z,r=1){for(const c of colliders){if(Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r)return true}return false}
