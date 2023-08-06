import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class normal_map_diffuse_lighting extends exampleScene {
    torusknot;
    lightOrbit;

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry();
        geometry.computeTangents();
        
        const vertexShader = `
            attribute vec3 tangent;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vNormal;
            varying vec3 vTangent;
            varying vec2 vUV;

            void main() {
                toWorld = transpose(inverse(mat3x3(modelMatrix)));

                vNormal = normal;
                vTangent = tangent;
                vec3 binormal = normalize(cross(vNormal, vTangent));
                
                vec3 N = normalize(toWorld * vNormal);
                vec3 T = normalize(toWorld * vTangent);
                vec3 B = normalize(toWorld * binormal);

                TBN = mat3x3(T, B, N);
                
                vUV = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`;

        const fragmentShader = `
            uniform sampler2D tex;
            uniform vec3 lightDirection;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                vec3 white = vec3(1.0, 1.0, 1.0);

                // 0 -> 1 rather than -1 -> 1
                vec3 light = lightDirection;
              
                // ensure it's normalized
                light = normalize(light);
              
                vec3 tanNormal = texture2D(tex, vUV).rgb;
                tanNormal = tanNormal * 2.0 - 1.0;

                vec3 worldNormal = normalize(TBN * tanNormal);

                float dot = dot(worldNormal, -light);
                dot = max(0.0, dot);
              
                // feed into our frag colour
                gl_FragColor = vec4(white * dot, 1.0);
                
            }`;

        const uniforms = {
            tex: { value: new THREE.TextureLoader().load("../assets/leaves_01_normal.jpg", (texture) => {
                texture.offset.x = 0;
                texture.offset.y = 0;
    
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.NearestMipMapLinearFilter;
            }) },
            lightDirection: { value: new THREE.Vector3(0, 0, 0) },
        };
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
        const torusknot = new THREE.Mesh( geometry, material );
        console.log(torusknot);
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

        this.torusknot.material.uniforms.lightDirection.value = new THREE.Vector3().subVectors(this.torusknot.position, this.lightOrbit.position);

        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Normal Map Diffuse Lighting</h2>
        <p> normal map? </p>
        <p> Tangent space? </p>

        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}