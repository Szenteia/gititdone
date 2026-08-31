import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { COLORS, GAME_CONFIG } from './config.js';

export class Track {
  constructor(scene) {
    this.scene = scene;
    this.curve = this.createCurve();
    this.length = this.curve.getLength();
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.buildRoad();
    this.buildEdgeLights();
    this.buildGates();
    this.buildWorldGeometry();
  }

  createCurve() {
    const points = [
      [0,2,0],[55,3,-12],[95,5,-55],[78,10,-108],[25,13,-132],[-35,9,-118],[-82,4,-78],[-105,2,-18],[-88,4,45],[-45,10,78],[8,18,82],[54,22,58],[92,14,18],[105,6,-30],[72,1,-68],[24,-2,-62],[-12,-4,-32],[-20,0,12],[10,4,38],[45,3,28],[62,2,2],[30,2,-12],[0,2,0]
    ].map(([x,y,z])=>new THREE.Vector3(x,y,z));
    return new THREE.CatmullRomCurve3(points,true,'catmullrom',0.34);
  }

  buildRoad() {
    const n = GAME_CONFIG.trackSegments;
    const positions=[], colors=[], indices=[];
    const palette=[new THREE.Color(COLORS.cyan),new THREE.Color(COLORS.orange),new THREE.Color(COLORS.violet),new THREE.Color(COLORS.yellow)];
    for(let i=0;i<=n;i++){
      const t=i/n, p=this.curve.getPointAt(t), tangent=this.curve.getTangentAt(t).normalize();
      const side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
      const c=palette[Math.floor(t*12)%palette.length];
      for(const s of [-1,1]){
        const v=p.clone().addScaledVector(side,s*GAME_CONFIG.trackWidth/2);
        positions.push(v.x,v.y,v.z); colors.push(c.r,c.g,c.b);
      }
      if(i<n){const a=i*2,b=a+1,c1=a+2,d=a+3;indices.push(a,b,c1,b,d,c1)}
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    g.setIndex(indices);g.computeVertexNormals();
    const road=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.68,metalness:.08,side:THREE.DoubleSide}));
    road.receiveShadow=true;this.group.add(road);
  }

  buildEdgeLights(){
    const material=new THREE.MeshBasicMaterial({color:COLORS.white});
    for(let i=0;i<180;i++){
      const t=i/180,p=this.curve.getPointAt(t),tan=this.curve.getTangentAt(t),side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
      for(const s of [-1,1]){
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,1.7),material);
        mesh.position.copy(p).addScaledVector(side,s*(GAME_CONFIG.trackWidth/2+.22));mesh.position.y+=.16;
        mesh.rotation.y=Math.atan2(tan.x,tan.z);this.group.add(mesh);
      }
    }
  }

  buildGates(){
    const gateMat=new THREE.MeshBasicMaterial({color:COLORS.white});
    [0,.18,.36,.54,.72,.9].forEach((t,index)=>{
      const p=this.curve.getPointAt(t),tan=this.curve.getTangentAt(t),side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
      const gate=new THREE.Group();
      for(const s of [-1,1]){
        const pillar=new THREE.Mesh(new THREE.BoxGeometry(.45,7,.45),gateMat);pillar.position.copy(p).addScaledVector(side,s*8);pillar.position.y+=3.5;gate.add(pillar);
      }
      const top=new THREE.Mesh(new THREE.BoxGeometry(16.5,.45,.45),gateMat);top.position.copy(p);top.position.y+=7;top.rotation.y=Math.atan2(side.x,side.z);gate.add(top);
      if(index===0){const bar=new THREE.Mesh(new THREE.BoxGeometry(13,.15,.8),new THREE.MeshBasicMaterial({color:COLORS.black}));bar.position.copy(p);bar.position.y+=.3;bar.rotation.y=Math.atan2(side.x,side.z);gate.add(bar)}
      this.group.add(gate);
    });
  }

  buildWorldGeometry(){
    const mats=[COLORS.orange,COLORS.cyan,COLORS.yellow,COLORS.violet].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.9}));
    for(let i=0;i<70;i++){
      const angle=i*2.399, radius=125+(i%8)*13, h=10+(i*17)%48;
      const mesh=new THREE.Mesh(new THREE.BoxGeometry(5+(i%4)*2,h,5+(i%3)*3),mats[i%4]);
      mesh.position.set(Math.cos(angle)*radius,h/2-8,Math.sin(angle)*radius);mesh.rotation.y=angle*.7;this.group.add(mesh);
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:i%2?COLORS.white:COLORS.black}));mesh.add(edges);
    }
    const floor=new THREE.Mesh(new THREE.CircleGeometry(300,64),new THREE.MeshStandardMaterial({color:0x101421,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-9;floor.receiveShadow=true;this.group.add(floor);
  }

  getFrame(progress,lateral=0){
    const t=((progress%1)+1)%1,p=this.curve.getPointAt(t),tangent=this.curve.getTangentAt(t).normalize();
    const side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
    p.addScaledVector(side,lateral);return {position:p,tangent,side};
  }
}
