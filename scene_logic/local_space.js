import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class local_space extends exampleScene {
    torusknot;
    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
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
        
        this.camera.position.z = 5;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( this.torusknot.position );
        controls.update();
        this.controls = controls;
    }
    processInput() {
        
    }
    update() {
        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Local Space</h2>
        <p>there's only position information</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}