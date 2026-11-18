// Juno Vale on foot: mesh, WASD movement relative to camera yaw, collision.
import {clamp} from "./config.js";
export function makePlayerMesh(){const g=new THREE.Group();
 const coat=new THREE.MeshLambertMaterial({color:0xd35400});const skin=new THREE.MeshLambertMaterial({color:0xc68863});
 const body=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.9,0.32),coat);body.position.y=0.98;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(0.23,8,6),skin);head.position.y=1.68;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(0.24,8,5),new THREE.MeshLambertMaterial({color:0x2b1a12}));hair.position.set(0,1.76,-0.03);g.add(hair);
 const legs=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.55,0.3),new THREE.MeshLambertMaterial({color:0x243447}));legs.position.y=0.28;g.add(legs);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.6,0.18),coat);arm.position.set(0.45,1.05,0.2);arm.name="arm";g.add(arm);
 const gun=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.12,0.5),new THREE.MeshLambertMaterial({color:0x111111}));gun.position.set(0.45,0.85,0.5);gun.name="gun";gun.visible=false;g.add(gun);
 return g}
export class Player{
 constructor(scene){this.mesh=makePlayerMesh();scene.add(this.mesh);this.x=-8;this.z=36;this.angle=0;this.health=100;this.speedWalk=7}
 get pos(){return{x:this.x,z:this.z}}
 update(dt,keys,yaw,collideFn,sprint){
  let mx=0,mz=0;if(keys["KeyW"])mz-=1;if(keys["KeyS"])mz+=1;if(keys["KeyA"])mx-=1;if(keys["KeyD"])mx+=1;
  const len=Math.hypot(mx,mz);this.moving=len>0;
  if(len>0){mx/=len;mz/=len;const sp=(sprint?11:7);const sin=Math.sin(yaw),cos=Math.cos(yaw);
   const wx=mx*cos-mz*sin,wz=mx*sin+mz*cos; // camera-relative: forward is -sin/-cos handled by yaw def in main
   const dx=(mx*cos+mz*sin),dz=(-mx*sin+mz*cos);
   // Use standard: forward vector (-sin yaw, -cos yaw) for W
   const fwd={x:-Math.sin(yaw),z:-Math.cos(yaw)},rgt={x:Math.cos(yaw),z:-Math.sin(yaw)};
   const vx=(fwd.x*(-mz)+rgt.x*mx),vz=(fwd.z*(-mz)+rgt.z*mx);
   const nx=this.x+vx*sp*dt,nzz=this.z+vz*sp*dt;
   if(!collideFn(nx,this.z,0.7))this.x=nx;if(!collideFn(this.x,nzz,0.7))this.z=nzz;
   this.angle=Math.atan2(vx,vz)}
  this.x=clamp(this.x,-228,228);this.z=clamp(this.z,-208,305);
  this.mesh.position.set(this.x,this.moving?Math.abs(Math.sin(performance.now()/110))*0.06:0,this.z);this.mesh.rotation.y=this.angle;
 }
}
