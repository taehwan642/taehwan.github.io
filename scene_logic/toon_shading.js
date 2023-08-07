import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class toon_shading extends exampleScene {
    torusKnot;
    lightOrbit;

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);
        geometry.computeTangents();
        
        const vertexShader = `
            attribute vec3 tangent;

            uniform vec3 lightDirection;
            uniform vec3 worldCameraPosition;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vTangent;
            varying vec2 vUV;

            void main() {
                toWorld = transpose(inverse(mat3x3(modelMatrix)));

                vPosition = vec3(modelMatrix * vec4(position, 1.0));
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
            uniform sampler2D diffuseTex;
            uniform sampler2D normalTex;
            uniform vec3 lightDirection;
            uniform vec3 ambient;
            uniform vec3 worldCameraPosition;
            uniform float glossiness;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                // diffuse
                vec3 diffuse = texture2D(diffuseTex, vUV).rgb;

                vec3 worldLightDirection = lightDirection;
                worldLightDirection = normalize(worldLightDirection);
              
                vec3 tanNormal = texture2D(normalTex, vUV).rgb;
                tanNormal = tanNormal * 2.0 - 1.0;

                vec3 worldNormal = normalize(TBN * tanNormal);

                float nDotL = dot(worldNormal, -worldLightDirection);
                nDotL = max(nDotL, 0.0);
              
                vec3 worldViewDirection = normalize(worldCameraPosition - vPosition);
                vec3 worldHalfWayDirection = normalize(-worldLightDirection + worldViewDirection);
                
                float specular = 0.0;
                float lightIntensity = smoothstep(0.0, 0.01, nDotL);
                if (nDotL > 0.0)
                {
                    specular = pow(max(dot(worldNormal, worldHalfWayDirection), 0.0) * lightIntensity, glossiness * glossiness);
                    specular = smoothstep(0.005, 0.01, specular);
                }

                vec3 finalColor = ambient + diffuse * lightIntensity + specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;

        const uniforms = {
            diffuseTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_diffuseOriginal.png", (texture) => {}) },
            normalTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_normal.png", (texture) => {}) },
            ambient: { value: new THREE.Vector3(0.2, 0.2, 0.2) },
            lightDirection: { value: new THREE.Vector3(0, 0, 0) },
            worldCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
            glossiness: { value: 18.0 },
        };
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });
        const torusKnot = new THREE.Mesh( geometry, material );
        this.torusKnot = torusKnot;
        this.scene.add( torusKnot );

        this.camera.position.z = 10;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( new THREE.Vector3(0, 0, 0) );
        controls.update();
        this.controls = controls;

        this.clock = new THREE.Clock();
        this.scale = 3;
        this.time = 0;

        const lightOrbit = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color : 0xffffff }) );
        this.lightOrbit = lightOrbit;
        this.scene.add(lightOrbit);
        lightOrbit.parent = torusKnot;
    }
    processInput() {
    }
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;

        this.lightOrbit.position.x = Math.cos(this.time) * this.scale;
        this.lightOrbit.position.z = Math.sin(this.time) * this.scale;

        let torusKnotWorldPosition = new THREE.Vector3();
        let lightOrbitWorldPosition = new THREE.Vector3();
        let cameraWorldPosition = new THREE.Vector3();

        this.torusKnot.getWorldPosition(torusKnotWorldPosition);
        this.lightOrbit.getWorldPosition(lightOrbitWorldPosition);
        this.camera.getWorldPosition(cameraWorldPosition);

        this.torusKnot.material.uniforms.lightDirection.value = new THREE.Vector3().subVectors(torusKnotWorldPosition, lightOrbitWorldPosition);
        this.torusKnot.material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);

        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Toon shading</h2>
        <p>what's the difference? specular, light intensity</p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}