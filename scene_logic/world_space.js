import * as THREE from 'three';
import exampleScene from './exampleScene.js'

export default class world_space extends exampleScene {
    cube;
    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
        const cube = new THREE.Mesh( geometry, material );
        this.cube = cube;
        this.scene.add( cube );
        
        this.camera.position.z = 5;
    }
    processInput() {
        
    }
    update() {
        this.cube.rotation.x -= 0.01;
        this.cube.rotation.y -= 0.01;
    }
    getDescription() {
        return `
        <h2>World Space</h2>
        <h2>1234Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your scene description goes here.</p>
        <p>Some LaTex: \(x = \\frac {{-b \\pm \\sqrt{{b^2-4ac}}}}{{2a}}\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        <h2>Scene Description</h2>
        <p>Your updated scene description goes here.</p>
        <p>Some other LaTex: \(E = mc^2\)</p>
        `;
    }
}