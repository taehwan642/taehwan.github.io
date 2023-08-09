import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'

export default class blinn_phong_reflection extends exampleScene {
    blinnTorusKnot;
    blinnLightOrbit;
    phongTorusKnot;
    phongLightOrbit;

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const blinnGeometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);
        blinnGeometry.computeTangents();
        
        const blinnVertexShader = `
            attribute vec3 tangent;

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

        const blinnFragmentShader = `
            uniform sampler2D diffuseTex;
            uniform sampler2D normalTex;
            uniform vec3 lightPosition;
            uniform vec3 ambient;
            uniform vec3 worldCameraPosition;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                // diffuse
                vec3 diffuse = texture2D(diffuseTex, vUV).rgb;

                vec3 worldLightDirection = vPosition - lightPosition;
                worldLightDirection = normalize(worldLightDirection);
              
                vec3 tanNormal = texture2D(normalTex, vUV).rgb;
                tanNormal = tanNormal * 2.0 - 1.0;

                vec3 worldNormal = normalize(TBN * tanNormal);

                float nDotL = dot(worldNormal, -worldLightDirection);
                nDotL = max(nDotL, 0.0);
              
                vec3 worldViewDirection = normalize(worldCameraPosition - vPosition);
                vec3 worldHalfWayDirection = normalize(-worldLightDirection + worldViewDirection);
                
                float specular = 0.0;
                if (nDotL > 0.0)
                {
                    specular = pow(max(dot(worldNormal, worldHalfWayDirection), 0.0), 32.0);
                }

                vec3 finalColor = ambient + diffuse * nDotL + specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;

        const blinnUniforms = {
            diffuseTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_diffuseOriginal.png", (texture) => {}) },
            normalTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_normal.png", (texture) => {}) },
            ambient: { value: new THREE.Vector3(0.2, 0.2, 0.2) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            worldCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
        };
        const blinnMaterial = new THREE.ShaderMaterial({
            uniforms: blinnUniforms,
            vertexShader: blinnVertexShader,
            fragmentShader: blinnFragmentShader,
        });
        const blinnTorusKnot = new THREE.Mesh( blinnGeometry, blinnMaterial );
        blinnTorusKnot.position.x = -4;
        this.blinnTorusKnot = blinnTorusKnot;
        this.scene.add( blinnTorusKnot );

        const phongGeometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 8, 2, 3);
        phongGeometry.computeTangents();
        
        const phongVertexShader = `
            attribute vec3 tangent;

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

        const phongFragmentShader = `
            uniform sampler2D diffuseTex;
            uniform sampler2D normalTex;
            uniform vec3 lightPosition;
            uniform vec3 ambient;
            uniform vec3 worldCameraPosition;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                // diffuse
                vec3 diffuse = texture2D(diffuseTex, vUV).rgb;

                vec3 worldLightDirection = vPosition - lightPosition;
                worldLightDirection = normalize(worldLightDirection);
              
                vec3 tanNormal = texture2D(normalTex, vUV).rgb;
                tanNormal = tanNormal * 2.0 - 1.0;

                vec3 worldNormal = normalize(TBN * tanNormal);

                float nDotL = dot(worldNormal, -worldLightDirection);
                nDotL = max(0.0, nDotL);
              
                vec3 worldViewDirection = normalize(worldCameraPosition - vPosition);
                vec3 worldReflectDirection = normalize(reflect(worldLightDirection, worldNormal));
                
                float specular = 0.0;
                if (nDotL > 0.0)
                {
                    specular = pow(max(dot(worldViewDirection, worldReflectDirection), 0.0), 32.0);
                }

                vec3 finalColor = ambient + diffuse * nDotL + specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;

        const phongUniforms = {
            diffuseTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_diffuseOriginal.png", (texture) => {}) },
            normalTex: { value: new THREE.TextureLoader().load("../assets/Dirt_01_normal.png", (texture) => {}) },
            ambient: { value: new THREE.Vector3(0.2, 0.2, 0.2) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            worldCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
        };
        const phongMaterial = new THREE.ShaderMaterial({
            uniforms: phongUniforms,
            vertexShader: phongVertexShader,
            fragmentShader: phongFragmentShader,
        });
        const phongTorusKnot = new THREE.Mesh( phongGeometry, phongMaterial );
        phongTorusKnot.position.x = 4;
        this.phongTorusKnot = phongTorusKnot;
        this.scene.add( phongTorusKnot );
        
        this.camera.position.z = 10;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( new THREE.Vector3(0, 0, 0) );
        controls.update();
        this.controls = controls;

        this.clock = new THREE.Clock();
        this.scale = 3;
        this.time = 0;

        const blinnLightOrbit = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color : 0x0000ff }) );
        this.blinnLightOrbit = blinnLightOrbit;
        this.scene.add(blinnLightOrbit);
        blinnLightOrbit.parent = blinnTorusKnot;

        const phongLightOrbit = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color : 0xff0000 }) );
        this.phongLightOrbit = phongLightOrbit;
        this.scene.add(phongLightOrbit);
        phongLightOrbit.parent = phongTorusKnot;
    }
    processInput() {
    }
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;

        this.blinnLightOrbit.position.x = Math.cos(this.time) * this.scale;
        this.blinnLightOrbit.position.z = Math.sin(this.time) * this.scale;

        this.phongLightOrbit.position.x = Math.cos(this.time) * this.scale;
        this.phongLightOrbit.position.z = Math.sin(this.time) * this.scale;

        let blinnLightOrbitWorldPosition = new THREE.Vector3();
        let phongLightOrbitWorldPosition = new THREE.Vector3();
        let cameraWorldPosition = new THREE.Vector3();

        this.blinnLightOrbit.getWorldPosition(blinnLightOrbitWorldPosition);
        this.phongLightOrbit.getWorldPosition(phongLightOrbitWorldPosition);
        this.camera.getWorldPosition(cameraWorldPosition);

        this.blinnTorusKnot.material.uniforms.lightPosition.value = new THREE.Vector3().add(blinnLightOrbitWorldPosition);
        this.blinnTorusKnot.material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);

        this.phongTorusKnot.material.uniforms.lightPosition.value = new THREE.Vector3().add(phongLightOrbitWorldPosition);
        this.phongTorusKnot.material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);

        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Blinn Phong Reflection</h2>
        <p>what's the difference? specular</p>
        <p>half vector?</p>
        <p>blue : blinn-phong / red : phong</p>

        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}