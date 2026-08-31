import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { COLORS } from './config.js';

export class JetDonut {
  constructor(scene){
    this.group=new THREE.Group();
    this.visual=new THREE.Group();
    this.group.add(this.visual);scene.add(this.group);
    this.build();
    this.attachmentSlots={top:new THREE.Object3D(),left:new THREE.Object3D(),right:new THREE.Object3D(),rear:new THREE.Object3D()};
    Object.values(this.attachmentSlots).forEach(slot=>this.visual.add(slot));
    this.attachmentSlots.top.position.set(0,2.1,0);this.attachmentSlots.left.position.set(-3,0,0);this.attachmentSlots.right.position.set(3,0,0);this.attachmentSlots.rear.position.set(0,0,2.8);
  }

  build(){
    const bodyMat=new THREE.MeshStandardMaterial({color:COLORS.orange,roughness:.35,metalness:.25});
    const body=new THREE.Mesh(new THREE.TorusGeometry(2.45,.92,18,48),bodyMat);body.rotation.x=Math.PI/2;body.castShadow=true;this.visual.add(body);
    body.add(new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry,28),new THREE.LineBasicMaterial({color:COLORS.white})));
    const icing=new THREE.Mesh(new THREE.TorusGeometry(2.46,.94,10,40,Math.PI*1.82),new THREE.MeshStandardMaterial({color:COLORS.violet,roughness:.42,metalness:.12}));icing.rotation.x=Math.PI/2;icing.rotation.z=.25;icing.position.y=.12;this.visual.add(icing);
    const core=new THREE.Mesh(new THREE.TorusGeometry(1.05,.12,10,32),new THREE.MeshBasicMaterial({color:COLORS.cyan}));core.rotation.x=Math.PI/2;core.position.y=.18;this.visual.add(core);
    for(const x of [-1.35,1.35]){
      const engine=new THREE.Group();engine.position.set(x,-.35,2.45);engine.rotation.x=Math.PI/2;
      const shell=new THREE.Mesh(new THREE.CylinderGeometry(.45,.62,1.4,16),new THREE.MeshStandardMaterial({color:0x191d29,metalness:.8,roughness:.28}));engine.add(shell);
      const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,2.2,12),new THREE.MeshBasicMaterial({color:COLORS.cyan,transparent:true,opacity:.9}));flame.position.y=1.75;engine.add(flame);engine.userData.flame=flame;this.visual.add(engine);
    }
  }

  updateVisual(speed,steer,time){
    this.visual.rotation.z=THREE.MathUtils.lerp(this.visual.rotation.z,-steer*.16,.12);
    this.visual.position.y=Math.sin(time*6)*.09;
    this.visual.children.forEach(child=>{if(child.userData.flame){const scale=.7+speed/55+Math.sin(time*22)*.08;child.userData.flame.scale.y=scale;}});
  }
}
