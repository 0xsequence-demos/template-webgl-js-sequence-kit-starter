import { Group, Color, MeshPhongMaterial, TetrahedronGeometry, Mesh } from 'three';
import { gsap } from "gsap";
import Airplane from './Game/Airplane.js';
import BasicLights from './Game/Lights.js';
import Sea from './Backgrounds/Sea.js';
import Sky from './Backgrounds/Sky.js';
import Enemy from './Game/Enemy.js';

import { SequenceController } from './API/SequenceController.js';
import { SequenceIndexer } from '@0xsequence/indexer';

const GameModes = {
	Intro: "intro",
	Playing: "playing",
	Paused: "paused",
	GameEnding: "gameending",
	GameOver: "gameover"
}

export default class MainScene extends Group {
  constructor() {
    super();

    this.sequenceController = new SequenceController(this);

    this.game_mode = GameModes.Intro;
    this.message_box = document.getElementById("replayMessage");

    this.sea = new Sea();
    this.sky = new Sky();
    this.airplane = new Airplane();
    this.lights = new BasicLights();

    this.sea.position.y = -500;
    this.sky.position.y = -400;

    this.airplane.scale.set(.25,.25,.25);
	  this.airplane.position.y = 200;
    this.airplane.position.x = -50;

    this.enemies = new Set();
    this.isFirstPylonCrash = false;

    this.enemiesTotal = 0;

    this.add(this.sky, this.sea, this.airplane, this.lights);

    this.resetGame();
  }

  resetGame() {
    this.game = {
      speed: .00035,
      baseSpeed: .00035,
      distanceForSpeedUpdate: 100,
      speedLastUpdate: 0,

      distance: 0,
      ratioSpeedDistance: 50,

      enemyLastSpawn: 0,
      enemyDistanceTolerance: 10,
      enemiesSpeed: 0.3,
      distanceForEnemiesSpawn: 30,

      planeDefaultHeight: 200,
      planeAmpHeight: 100,
      planeFallSpeed: 0.001,

      seaRadius: 500,
    }
    this.isFirstPylonCrash = false
    this.enemiesTotal = 0;
  }

  updateSpeed(deltaTime) {
    if (this.game_mode !== GameModes.Playing) return;

    this.game.speed += this.game.baseSpeed * deltaTime * 0.00002;
  }

  updateDistance(deltaTime) {
    if (this.game_mode !== GameModes.Playing) return;

    this.game.distance += this.game.speed * deltaTime * this.game.ratioSpeedDistance;
    this.distance_box.innerHTML = Math.floor(this.game.distance);

    if (Math.floor(this.game.distance) % this.game.distanceForSpeedUpdate == 0 && Math.floor(this.game.distance) > this.game.speedLastUpdate){
      this.game.speedLastUpdate = Math.floor(this.game.distance);
      this.game.targetBaseSpeed += this.game.incrementSpeedByTime * deltaTime;
    }
  }

  handleMouseClick() {
    if (this.sequenceController.mode !== AuthModes.Completed) {
      this.openLoginModal();
      return;
    }

    if (this.game_mode === GameModes.Intro) {
      this.switchGameMode(GameModes.Playing);
    } else if (this.game_mode === GameModes.Playing) {
      this.switchGameMode(GameModes.Paused);
    } else if (this.game_mode === GameModes.Paused) {
      this.switchGameMode(GameModes.Playing);
    } else if (this.game_mode === GameModes.GameOver) {
      for (const enemy of this.enemies) {
        this.remove(enemy);
        this.enemies.delete(enemy);
      }

      this.resetGame();
      this.switchGameMode(GameModes.Playing);
    }
  }

  collideCheck(mesh1, mesh2, tolerance) {
		const diffPos = mesh1.position.clone().sub(mesh2.position.clone());
		const d = diffPos.length();
		return d < tolerance;
	}

  tick(deltaTime, mousePos) {
    this.sky.rotation.z += deltaTime * this.game.speed / 2;
    this.sea.tick(deltaTime, this.game.speed);
    this.updatePlane(deltaTime, mousePos);
  }

  updatePlane(deltaTime, mousePos) {
    // let's move the airplane between -100 and 100 on the horizontal axis, 
    // and between 25 and 175 on the vertical axis,
    // depending on the mouse position which ranges between -1 and 1 on both axes;
    // to achieve that we use a normalize function (see below)

    var targetY = this.normalize(mousePos.y, -.75, .75, 25, 175) + 100;
    // var targetX = this.normalize(mousePos.x, -.75, .75, -100, 100);
    
    // Move the plane at each frame by adding a fraction of the remaining distance
    this.airplane.position.y += (targetY - this.airplane.position.y) * 0.1;

    // Rotate the plane proportionally to the remaining distance
    this.airplane.rotation.z = (targetY - this.airplane.position.y) * 0.0128;
    this.airplane.rotation.x = (this.airplane.position.y - targetY) * 0.0064;

    this.airplane.tick(deltaTime);
  }

  spawnParticles(pos, count, color, scale) {
    for (let i = 0; i < count; i++) {
      const geom = new TetrahedronGeometry(3, 0);
      const mat = new MeshPhongMaterial({
        color: 0x009999,
        shininess: 0,
        specular: 0xffffff,
        flatShading: true,
      });
      const mesh = new Mesh(geom, mat);
      this.add(mesh);
  
      mesh.visible = true;
      mesh.position.copy(pos);
      mesh.material.color = color;
      mesh.material.needsUpdate = true;
      mesh.scale.set(scale, scale, scale);
      const targetX = pos.x + (-1 + Math.random()*2) * 50;
      const targetY = pos.y + (-1 + Math.random()*2) * 50;
      const targetZ = pos.z + (-1 + Math.random()*2) * 50;
      const speed = 0.6 + Math.random() * 0.2;
      gsap.to(mesh.rotation, speed, {x: Math.random() * 12, y: Math.random() * 12});
      gsap.to(mesh.scale, speed, {x:.1, y:.1, z:.1});
      gsap.to(mesh.position, speed, {x:targetX, y:targetY, z: targetZ, delay:Math.random() *.1, ease: "power2.out", onComplete: () => {
        this.remove(mesh);
      }});
    }
  }
  
  normalize(v,vmin,vmax,tmin, tmax) {
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax-vmin;
    var pc = (nv-vmin)/dv;
    var dt = tmax-tmin;
    var tv = tmin + (pc*dt);
    return tv;
  }

  async login() {
    document.getElementById('login').style.display = 'none'
    document.getElementById('mintBtn').style.display = 'flex'
    document.getElementById('mintAchievementBtn').style.display = 'flex'

    // check for achievement balance
    this.indexer = new SequenceIndexer(
        'https://arbitrum-sepolia-indexer.sequence.app',
        process.env.PROJECT_ACCESS_KEY
      );

    const response = await this.indexer.getTokenBalances({
        accountAddress: this.sequenceController.walletAddress,
        contractAddress: '0x856de99d7647fb7f1d0f60a04c08340db3875340', // replace with your achievements contract
    })
    
    if(response.balances.length > 0){
      console.log(response) 
      document.getElementById('burnBtn').style.display = 'flex'
    }
  }

  logout(){
    document.getElementById('login').style.display = 'block'
    document.getElementById('mintBtn').style.display = 'none'
    document.getElementById('mintAchievementBtn').style.display = 'none'
    document.getElementById('burnBtn').style.display = 'none'
  }
}