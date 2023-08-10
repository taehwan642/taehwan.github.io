import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class shader extends exampleScene {
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
            vertexShader: vertexShader,
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
        <h2>Shader</h2>
        <p>There's a two types of shader, <code>vertex shader</code> and <code>fragment shader.</code></p>
        <h3>Vertex Shader</h3>
        <p>Vertex shader is called when each of model's vertex starts to be calculated before drawing your model.</p>
        <p>You can understand like this : <code>for (vertices) vertexShader();</code></p>
        <h3>Fragment Shader</h3>
        <p>Fragment shader is called for one pixel for each triangle drawn in the model.</p>
        <h3>Usage</h3>
        <p>Shader can do lots of things, <strong>almost</strong> anything you can imagine.</p>
        <p>In the screen, you can see torusknot drawn by shader. and it has an really simple code.</p>
        <p>vertex shader : </p>
        <code>void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }</code>
        <p>"position" is a local space vertex position, and shader is calculating to make local vertex position to clip space, and return.</p>
        <p>fragment shader : </p>
        <code>void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }</code>
        <p>setting the triangle's pixel color to white (1, 1, 1).</p>
        <h3>Summarize</h3>
        <p>Vertex shader : each vertex, Fragment shader : each triangle pixel.</p>
        <p>Vertex shader returns clip space vertex coord, Fragment shader returns pixel's color.</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}