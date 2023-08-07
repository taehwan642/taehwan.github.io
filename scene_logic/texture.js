import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class texture extends exampleScene {
    torusknot;
    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);

        const vertexShader = `
            varying vec2 vUV;
            void main() {
                vUV = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        const fragmentShader = `
            uniform sampler2D diffuseTex;

            varying vec2 vUV;

            void main() {
                gl_FragColor = vec4(texture2D(diffuseTex, vUV).rgb, 1.0);
            }`;
        const uniforms = {
            diffuseTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_diffuseOriginal.png", (texture) => {}) },
        };
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
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
        <h2>Texture</h2>
        <p>uv?</p>
        <p>If there is a known issue with the service, you will see a
        <img src="../assets/Dirt_01_diffuseOriginal.png" alt="Warning!" height="100" width="100"> icon
        in the upper right-hand corner.</p>
        <p>images from</p>
        <p>https://www.artstation.com/marketplace/p/BR0L/free-11-high-quality-material-textures-including-normal-maps-displacement-maps-and-smoothness-maps-2k-4k</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}