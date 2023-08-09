import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class lambertian_reflectance extends exampleScene {
    torusknot;
    lightOrbit;

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);
        geometry.computeTangents();
        
        const vertexShader = `
            varying mat4x4 toWorld;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;
            void main() {
                vUV = uv;
                toWorld = transpose(inverse(modelMatrix));
                vPosition = vec3(modelMatrix * vec4(position, 1.0));
                vNormal = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        const fragmentShader = `
        varying mat4x4 toWorld;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUV;
        uniform vec3 lightPosition;
        void main() {
            // 0 -> 1 rather than -1 -> 1
            vec3 light = vPosition - lightPosition;
            
            // ensure it's normalized
            light = normalize(light);
            
            vec3 normal = normalize((toWorld * vec4(vNormal, 0.0)).xyz);
            // calculate the dot product of
            // the light to the vertex normal
            float dProd = max(0.0,
                                dot(normal, -light));
            
            // feed into our frag colour
            gl_FragColor = vec4(dProd, dProd, dProd, 1.0);
            
        }`;

        const uniforms = {
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
        };
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
        const torusknot = new THREE.Mesh( geometry, material );
        this.torusknot = torusknot;
        this.scene.add( torusknot );
        
        this.camera.position.z = 5;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( this.torusknot.position );
        controls.update();
        this.controls = controls;

        this.clock = new THREE.Clock();
        this.scale = 3;
        this.time = 0;

        const lightOrbit = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color : 0xffffff }) );
        this.lightOrbit = lightOrbit;
        this.scene.add(lightOrbit);
        lightOrbit.parent = torusknot;
    }
    processInput() {
    }
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;
        this.torusknot.scale.y = (Math.cos(this.time) + 2) / 2;

        this.lightOrbit.position.x = Math.cos(this.time) * this.scale;
        this.lightOrbit.position.z = Math.sin(this.time) * this.scale;

        let lightOrbitWorldPosition = new THREE.Vector3();

        this.lightOrbit.getWorldPosition(lightOrbitWorldPosition);

        this.torusknot.material.uniforms.lightPosition.value = new THREE.Vector3().add(lightOrbitWorldPosition);

        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Lambertian Reflectance</h2>
        <p> diffuse? </p>
        <p> transposed inversed world matrix? for what? </p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}