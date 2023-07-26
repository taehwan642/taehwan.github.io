import * as THREE from 'three';
import exampleScene from './exampleScene.js'

export default class world_space extends exampleScene {
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
        this.torusknot.rotation.x += 0.01;
        this.torusknot.rotation.y += 0.01;
    }
    getDescription() {
        return `
        <h2>World Space</h2>
        <p>scale, rotation, translation information</p>
        `;
    }
}