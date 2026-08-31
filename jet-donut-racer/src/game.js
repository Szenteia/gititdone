import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GAME_CONFIG, COLORS } from './config.js';
import { Track } from './track.js';
import { JetDonut } from './vehicle.js';
import { InputController } from './input.js';

export class Game{
  constructor(container){
    this.container=container;this.scene=new THREE.Scene();this.scene.background=new THREE.Color(COLORS.sky);this.scene.fog=new THREE.FogExp2(COLORS.sky,.0045);
    this.camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,700);this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=true;container.appendChild(this.renderer.domElement);
    this.clock=new THREE.Clock();this.track=new Track(this.scene);this.vehicle=new JetDonut(this.scene);this.input=new InputController();this.progress=0;this.lateral=0;this.speed=0;this.lap=1;this.elapsed=0;this.running=false;this.finished=false;this.setupLights();this.bindUI();this.onResize=()=>this.resize();window.addEventListener('resize',this.onResize);this.animate();
  }
  setupLights(){this.scene.add(new THREE.HemisphereLight(0xffffff,0x101020,2.5));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(60,100,20);sun.castShadow=true;this.scene.add(sun)}
  bindUI(){this.lapEl=document.querySelector('#lap');this.timeEl=document.querySelector('#time');this.speedEl=document.querySelector('#speed');this.startPanel=document.querySelector('#start-panel');this.finishPanel=document.querySelector('#finish-panel');document.querySelector('#start-button').addEventListener('click',()=>this.start());document.querySelector('#restart-button').addEventListener('click',()=>this.start())}
  start(){this.progress=0;this.lateral=0;this.speed=GAME_CONFIG.cruiseSpeed;this.lap=1;this.elapsed=0;this.finished=false;this.running=true;this.startPanel.classList.add('hidden');this.finishPanel.classList.add('hidden')}
  update(dt,time){
    if(!this.running)return;
    if(this.input.accelerate)this.speed+=GAME_CONFIG.acceleration*dt;else this.speed-=GAME_CONFIG.drag*dt;
    if(this.input.brake)this.speed-=GAME_CONFIG.braking*dt;this.speed=THREE.MathUtils.clamp(this.speed,GAME_CONFIG.minSpeed,GAME_CONFIG.maxSpeed);
    const steer=this.input.steering;const steerFactor=.5+.5*(this.speed/GAME_CONFIG.maxSpeed);this.lateral+=steer*GAME_CONFIG.steeringSpeed*steerFactor*dt;this.lateral=THREE.MathUtils.clamp(this.lateral,-GAME_CONFIG.trackWidth*.42,GAME_CONFIG.trackWidth*.42);
    const previous=this.progress;this.progress+=this.speed*dt/this.track.length;if(previous%1>this.progress%1){this.lap++;if(this.lap>GAME_CONFIG.laps){this.finish();return}}
    this.elapsed+=dt;const frame=this.track.getFrame(this.progress,this.lateral);this.vehicle.group.position.copy(frame.position);this.vehicle.group.position.y+=1.2;this.vehicle.group.rotation.y=Math.atan2(frame.tangent.x,frame.tangent.z);this.vehicle.updateVisual(this.speed,steer,time);
    const behind=frame.tangent.clone().multiplyScalar(-GAME_CONFIG.cameraDistance),target=frame.position.clone().add(behind);target.y+=GAME_CONFIG.cameraHeight;this.camera.position.lerp(target,1-Math.pow(.001,dt));const look=frame.position.clone().addScaledVector(frame.tangent,11);look.y+=1.5;this.camera.lookAt(look);this.updateHUD();
  }
  finish(){this.running=false;this.finished=true;this.speed=0;document.querySelector('#finish-time').textContent=`Összidő: ${this.formatTime(this.elapsed)}`;this.finishPanel.classList.remove('hidden');this.updateHUD()}
  updateHUD(){this.lapEl.textContent=`${Math.min(this.lap,GAME_CONFIG.laps)} / ${GAME_CONFIG.laps}`;this.timeEl.textContent=this.formatTime(this.elapsed);this.speedEl.textContent=Math.round(this.speed*5.2)}
  formatTime(seconds){const m=Math.floor(seconds/60),s=Math.floor(seconds%60),d=Math.floor((seconds%1)*10);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${d}`}
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight)}
  animate(){requestAnimationFrame(()=>this.animate());const dt=Math.min(this.clock.getDelta(),.05),time=this.clock.elapsedTime;this.update(dt,time);if(!this.running){const f=this.track.getFrame(this.progress,this.lateral);this.vehicle.group.position.copy(f.position);this.vehicle.group.position.y+=1.2;this.vehicle.group.rotation.y=Math.atan2(f.tangent.x,f.tangent.z);this.vehicle.updateVisual(this.speed,0,time);const back=f.tangent.clone().multiplyScalar(-16);this.camera.position.lerp(f.position.clone().add(back).add(new THREE.Vector3(0,8,0)),.05);this.camera.lookAt(f.position.clone().add(new THREE.Vector3(0,1,0)))}this.renderer.render(this.scene,this.camera)}
}
