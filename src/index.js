import React from 'react'
import * as ReactDOM from 'react-dom/client';
import './styles.css'

import { WebGLRenderer, PerspectiveCamera, Scene, Fog } from 'three';
import MainScene from './Scene.js';
const indexerDelay = 2500;
// react render
const root = ReactDOM.createRoot(document.getElementById('root'))

const { innerHeight, innerWidth } = window;
var aspectRatio = innerHeight / innerWidth;
var fieldOfView = 60;
var nearPlane = 1;
var farPlane = 10000;

const scene = new Scene();
const camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
const renderer = new WebGLRenderer({antialias: true, alpha: true});
const mainScene = new MainScene();

// scene
scene.fog = new Fog(0xf7d9aa, 100, 950);
scene.add(mainScene);

// camera
camera.position.set(0, 200, 200);

// renderer
renderer.shadowMap.enabled = true;
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setClearColor(0x7ec0ee, 1);

// render loop
var mousePos={x:0, y:0};
var prevTimeStamp = 0;
const onAnimationFrameHandler = (timeStamp) => {
  const deltaTime = timeStamp - prevTimeStamp;
  renderer.render(scene, camera);
  mainScene.tick && mainScene.tick(deltaTime, mousePos);
  prevTimeStamp = timeStamp;
  window.requestAnimationFrame(onAnimationFrameHandler);
}
window.requestAnimationFrame(onAnimationFrameHandler);

const windowResizeHanlder = () => { 
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  windowResizeHanlder();
  window.addEventListener('resize', windowResizeHanlder);

// dom
document.body.style.margin = 0;
document.getElementById("world").appendChild( renderer.domElement );