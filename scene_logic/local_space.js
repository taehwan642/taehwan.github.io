import * as THREE from 'three';
import exampleScene from './exampleScene.js'

export default class local_space extends exampleScene {
    torusknot;
    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry();
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const torusknot = new THREE.Mesh( geometry, material );
        this.torusknot = torusknot;
        material.wireframe = true;
        this.scene.add( torusknot );
        
        this.camera.position.z = 5;
    }
    processInput() {
        
    }
    update() {
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