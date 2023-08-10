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
        <p>In vertex information, uv is needed when you want to put textures in the model.</p>
        <p>uv is a texture coordinate, and each vertex has that information.</p>
        <p>When in pixel shader, you can get pixel's UV texture coordinate [0, 1], and use specific function to get corresponding texel(unit of texture) by that UV.</p>
        <p>If diffuse texture is this, <img src="../assets/Dirt_01_diffuseOriginal.png" alt="Warning!" height="100" width="100"></p>
        <p>And use the shader below, then it will work like that torusknot.</p>
        <h3>Shader code</h3>
        <p>Get texture</p>
        <code>uniform sampler2D diffuseTex;</code>
        <p>Get uv</p>
        <code>varying vec2 vUV;</code>
        <p>Get corresponding texel color and give it to output pixel color.</p>
        <code>void main() {
            gl_FragColor = vec4(texture2D(diffuseTex, vUV).rgb, 1.0);
        }</code>
        <p>images from</p>
        <p>https://www.artstation.com/marketplace/p/BR0L/free-11-high-quality-material-textures-including-normal-maps-displacement-maps-and-smoothness-maps-2k-4k</p>
        <h3>Summarize</h3>
        <p>UV : texture coordinate</p>
        <p>In shaders, there's a functions to get texel color with UV and texture.</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}