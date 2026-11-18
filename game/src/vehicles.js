// Vehicle meshes and arcade car entity.
import {clamp} from "./config.js";
let nextId=1;
export function makeVehicleMesh(type,color){
 const g=new THREE.Group();const paint=new THREE.MeshLambertMaterial({color});const dark=new THREE.MeshLambertMaterial({color:0x1c222b});const glass=new THREE.MeshLambertMaterial({color:0x9fd4e8});
 let L=4.2,W=1.9,H=0.9,cabH=0.7;
 if(type==="truck"){L=6.2;H=1.1;const box=new THREE.Mesh(new THREE.BoxGeometry(W,2.2,3.6),new THREE.MeshLambertMaterial({color:0xe8e4da}));box.position.set(0,1.5,-0.9);g.add(box)}
 if(type==="bus"){L=9;W=2.4;H=1.6;cabH=0.9}
 if(type==="police"){/* paint handled by caller */}
 const body=new THREE.Mesh(new THREE.BoxGeometry(W,H,L),paint);body.position.y=0.65;body.name="paint";g.add(body);
 const cab=new THREE.Mesh(new THREE.BoxGeometry(W*0.85,cabH,L*0.45),type==="bus"?paint:glass);cab.position.set(0,1.25,-0.2);g.add(cab);
 if(type==="police"){const bar=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.25,0.5),new THREE.MeshBasicMaterial({color:0xff3344}));bar.position.set(0,1.75,-0.2);bar.name="lightbar";g.add(bar);const stripe=new THREE.Mesh(new THREE.BoxGeometry(W+0.02,0.35,L*0.9),new THREE.MeshLambertMaterial({color:0xffffff}));stripe.position.y=0.7;g.add(stripe)}
 if(type==="taxi"){const s=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.3,0.4),new THREE.MeshBasicMaterial({color:0xffe14d}));s.position.set(0,1.7,-0.2);g.add(s)}
 const wg=new THREE.CylinderGeometry(0.38,0.38,0.3,10);wg.rotateZ(Math.PI/2);
 const wheels=[];for(const [wx,wz] of [[-W/2, L/2-0.8],[W/2,L/2-0.8],[-W/2,-L/2+0.8],[W/2,-L/2+0.8]]){const w=new THREE.Mesh(wg,dark);w.position.set(wx,0.38,wz);g.add(w);wheels.push(w)}
 const hl=new THREE.Mesh(new THREE.BoxGeometry(W*0.7,0.18,0.1),new THREE.MeshBasicMaterial({color:0xfff2b0}));hl.position.set(0,0.75,L/2+0.02);g.add(hl);
 const flame=new THREE.Mesh(new THREE.ConeGeometry(0.28,1.4,6),new THREE.MeshBasicMaterial({color:0x33baff,transparent:true,opacity:0.9}));flame.rotation.x=Math.PI/2;flame.position.set(0,0.55,-L/2-0.7);flame.visible=false;flame.name="flame";g.add(flame);
 g.userData={paint,wheels,flame};return g;
}
export class Car{
 constructor(scene,type,color,x,z,angle=0){this.id=nextId++;this.type=type;this.color=color;this.mesh=makeVehicleMesh(type,color);this.mesh.position.set(x,0,z);this.mesh.rotation.y=angle;scene.add(this.mesh);this.x=x;this.z=z;this.angle=angle;this.speed=0;this.steer=0;this.health=100;this.occupied=false;this.build={color,engine:false,armour:false,nitro:false};this.L=type==="bus"?9:type==="truck"?6.2:4.2}
 get pos(){return{x:this.x,z:this.z}}
 sync(){this.mesh.position.set(this.x,0,this.z);this.mesh.rotation.y=this.angle;const f=this.mesh.userData.flame;if(f)f.visible=!!this.boosting&&this.speed>2;for(const w of this.mesh.userData.wheels)w.rotation.x+=this.speed*0.06}
 setColor(c){this.color=c;this.build.color=c;this.mesh.userData.paint.color.setHex(c)}
 drive(dt,input,colliders){ // input {throttle, steer, brake, boost}
  const eng=this.build.engine?1.35:1;const maxF=(this.type==="bus"?16:this.type==="truck"?19:27)*eng,maxR=9;
  let acc=0;if(input.throttle>0)acc=14*eng;else if(input.throttle<0)acc=this.speed>0.5?-22:-8;
  this.speed+=acc*dt*(input.boost&&this.build.nitro?1.7:1);
  if(input.brake)this.speed-=Math.sign(this.speed)*26*dt;
  this.speed-=this.speed*0.55*dt; // drag
  this.speed=clamp(this.speed,-maxR,maxF*(input.boost&&this.build.nitro?1.35:1));
  this.boosting=!!(input.boost&&this.build.nitro&&input.throttle>0);
  const sf=clamp(this.speed/10,-1,1);this.angle+=input.steer*1.55*dt*sf*(input.brake?1.35:1);
  const nx=this.x+Math.sin(this.angle)*this.speed*dt,nz=this.z+Math.cos(this.angle)*this.speed*dt;
  let hit=false;if(colliders)for(const c of colliders){if(Math.abs(nx-c.x)<c.w/2+0.5&&Math.abs(nz-c.z)<c.d/2+0.5){hit=true;break}}
  if(hit){const dmg=Math.abs(this.speed)*(this.build.armour?0.35:1);this.health-=dmg*0.7;this.speed*=-0.3;this.hitFlash=dmg}
  else{this.x=nx;this.z=nz}
  this.x=clamp(this.x,-228,228);this.z=clamp(this.z,-208,300);
  this.sync();return hit;
 }
}
