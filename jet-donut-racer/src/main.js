import { Game } from './game.js';

const container=document.querySelector('#game-canvas');
if(!container)throw new Error('Game canvas container is missing.');
new Game(container);
