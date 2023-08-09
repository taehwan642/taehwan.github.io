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
            vertexShader: vertexShader,
            wireframe: true,
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
        <p>If you make or get some model file in internet, and after if you open that in plain text, you'll notice that model files are basically a information about "What information does the program need to know to draw this model?"</p>
        <p>And that "information" is normally a vertex and index. Vertex is a position of 3D model's point.</p>
        <p>Index is about "which 3 vertex index you are going to use to make a triangle".</p>
        <p>Of course 3D models needs to know more. Like textures, materials, and others. <strong>But the basic information is vertex and index.</strong> You cannot draw 3D models without this informations.</p>
        <p>So why did i mentioned vertex and index? If i dont do any mathematical calculations on vertices after I load the 3D model, that vertices are on Local Space.</p>
        <h3>Summerize</h3>
        <p>That's Local Space. The space where the points (vertices) of the 3D mesh are located without any mathematical calculation.</p>
        <p>In the screen, you can see the torusknot is not scaling, rotating, and not moving around.</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}