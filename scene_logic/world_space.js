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
        <p>scale, rotation, translation information</p>
        <p> scale = $\\cos(t) + 2$ </p>
        <p> rotation.y += $s * d$ </p>
        <p> position.x = $\\cos(t) * s$ </p>
        <p> position.z = $\\sin(t) * s$ </p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}