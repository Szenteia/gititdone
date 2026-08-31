export class InputController{
  constructor(){this.keys=new Set();this.bindKeyboard();this.bindTouch()}
  bindKeyboard(){window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code))e.preventDefault();this.keys.add(e.code)});window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>this.keys.clear())}
  bindTouch(){document.querySelectorAll('[data-control]').forEach(button=>{const map={left:'ArrowLeft',right:'ArrowRight',accelerate:'ArrowUp',brake:'ArrowDown'},code=map[button.dataset.control];const on=e=>{e.preventDefault();this.keys.add(code)},off=e=>{e.preventDefault();this.keys.delete(code)};button.addEventListener('pointerdown',on);button.addEventListener('pointerup',off);button.addEventListener('pointercancel',off);button.addEventListener('pointerleave',off)})}
  get accelerate(){return this.keys.has('ArrowUp')||this.keys.has('KeyW')}
  get brake(){return this.keys.has('ArrowDown')||this.keys.has('KeyS')}
  get steering(){return (this.keys.has('ArrowRight')||this.keys.has('KeyD')?1:0)-(this.keys.has('ArrowLeft')||this.keys.has('KeyA')?1:0)}
}
