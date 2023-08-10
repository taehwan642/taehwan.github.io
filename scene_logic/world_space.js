import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class world_space extends exampleScene {
    torusknot;
    clock;
    time;
    scale;

    initialize(clientWidth, clientHeight) {
        const scene = new THREE.Scene();
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);

        const vertexShader = `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        const fragmentShader = `
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }`;

        const material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        });
        const torusknot = new THREE.Mesh( geometry, material );
        this.torusknot = torusknot;
        this.scene.add( torusknot );
        
        this.camera.position.z = 50;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( this.torusknot.position );
        controls.update();
        this.controls = controls;

        this.clock = new THREE.Clock();
        this.time = 0;
        this.scale = 5;
    }
    processInput() {
    }
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;
        this.torusknot.rotation.y += this.scale * delta;
        this.torusknot.position.x = Math.cos(this.time) * this.scale * 2;
        this.torusknot.position.z = Math.sin(this.time) * this.scale * 2;
        this.torusknot.scale.x = Math.cos(this.time) + 2;
        this.torusknot.scale.y = Math.cos(this.time) + 2;
        this.torusknot.scale.z = Math.cos(this.time) + 2;
        this.controls.update();
    }
    getDescription() {
        return `
        <h2>World Space</h2>
        <p>In World Space, you can place 3D models in "World", by transform.</p>
        <p>Transform is an information about how you going to <strong>scale, rotation, translation</strong> the model in the World.</p>
        <p>For example, there are 2 models. A model's size is 1000 in local space, and B model's size is 1. If you scaled A model's size to $1 \\over 1000$, then A and B is going to have the same size in World Space.</p>
        <h3>Way to change Local Space to World Space</h3>
        <p>You need to calculate scale, rotation, translation to set model in world space.</p>
        <p>scale : <code>vertex.x * scale.x, vertex.y * scale.y, vertex.z * scale.z</code></p>
        <p>translation : <code>vertex + translation</code></p>
        <h3>Rotation?</h3>
        <p>There's a LOT of things to say about rotation. but I will try to make it easy and clear.</p>
        <p>We are going to use euler angles, that uses x y z rotation values to tell you "how much you want to make the model rotate in each axis?".</p>
        <p>x y z axis are different in each engines. Like "Unity" and "Unreal". So with rotation, we are going to use different word to represent each rotation axis. The Yaw Pitch Roll.</p>
        <p>In this examples, x axis is Pitch, y axis is Yaw, z axis is Roll.</p>
        <p>Yaw : <code>vertex.x, vertex.y * cos(angle) - vertex.z * sin(angle), vertex.z * cos(angle) + vertex.y * sin(angle)</code></p>
        <p>Pitch : <code>vertex.x * cos(angle) + vertex.z * sin(angle), vertex.y, vertex.z * cos(angle) - vertex.x * sin(angle)</code></p>
        <p>Roll : <code>vertex.x * cos(angle) - vertex.y * sin(angle), vertex.y * cos(angle) + vertex.x * sin(angle), vertex.z</code></p>
        <p>In the screen, torusknot is calculated by this formula</p>
        <p>scale = $\\cos(t) + 2$ </p>
        <p>Yaw Angle += $s * d$ </p>
        <p>position.x = $\\cos(t) * s$ </p>
        <p>position.z = $\\sin(t) * s$ </p>
        <h3>Summarize</h3>
        <p>If you want to move your model to world space, then you need to have model's transform. after transform calculation, the model is in world space.</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}