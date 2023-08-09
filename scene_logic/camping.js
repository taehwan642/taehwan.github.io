import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import exampleScene from './exampleScene.js'
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const ModelIndex = {
    TREE1: 0,
    TREE2: 1,
    TREE3: 2,
    TREE4: 3,
    ROCK1: 4,
    ROCK2: 5,
    STUMP: 6,
    LOG: 7,
    BUSH: 8,
    MUSHROOM: 9,
    FLOWER: 10,
};

export default class camping extends exampleScene {
    torusKnot;
    lightOrbit;
    loadedMesh;

    async initialize(clientWidth, clientHeight) {
        const scene = new THREE.Scene();
        this.scene = scene;
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        this.camera.position.y = 35;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.target.copy( new THREE.Vector3(-30, 0, 0) );
        controls.update();
        this.controls = controls;

        this.clock = new THREE.Clock();
        this.scale = 70;
        this.time = 0;

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
            uniform vec3 lightPosition;
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

                vec3 worldLightDirection = vPosition - lightPosition;
                worldLightDirection = normalize(worldLightDirection);
            
                vec3 worldNormal = normalize(toWorld * vNormal);

                float nDotL = dot(worldNormal, -worldLightDirection);
                nDotL = max(nDotL, 0.0);
            
                vec3 worldViewDirection = normalize(worldCameraPosition - vPosition);
                vec3 worldHalfWayDirection = normalize(-worldLightDirection + worldViewDirection);
                
                float specular = 0.0;
                if (nDotL > 0.0)
                {
                    specular = pow(max(dot(worldNormal, worldHalfWayDirection), 0.0), glossiness * glossiness);
                }

                vec3 finalColor = ambient + diffuse * nDotL + specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;


        const uniforms = {
            diffuseTex: { value: new THREE.TextureLoader().load("../assets/texture_gradient.png", (texture) => {}) },
            normalTex: { value: new THREE.TextureLoader().load("../assets/texture_gradient.png", (texture) => {}) },
            ambient: { value: new THREE.Vector3(0.12, 0.12, 0.12) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            worldCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
            glossiness: { value: 8.0 },
            time: { value: 0.0 },
            repeat: { value: new THREE.Vector2(0, 0) },
        };
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        const lightOrbit = new THREE.Mesh( new THREE.SphereGeometry(5, 32, 16), new THREE.MeshBasicMaterial({color : 0xffa500 }) );
        this.lightOrbit = lightOrbit;
        this.scene.add(lightOrbit);

        const planeGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            -0.5, 0.000000, 0.5,
            0.5, 0.000000, 0.5,
            -0.5, 0.000000, -0.5,
            0.5, 0.000000, -0.5,
        ]);
        const indices = [
            0, 1, 2, 
            1, 3, 2
        ];
        const normal = new Float32Array([
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]);
        const uv = new Float32Array([
            0.188130, 0.981151,
            0.118111, 0.981285,
            0.116558, 0.749318,
            0.186577, 0.749183,
        ]);
        planeGeometry.setIndex(indices);
        planeGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        planeGeometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
        planeGeometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        planeGeometry.computeTangents();
        const plane = new THREE.Mesh( planeGeometry, material.clone() );
        plane.scale.x = 60;
        plane.scale.z = 60;
        this.plane = plane;
        this.scene.add(plane);

        const waterGeometry = new THREE.PlaneGeometry(1, 1);
        waterGeometry.computeTangents();
        const water = new THREE.Mesh( waterGeometry, material.clone() );
        water.scale.x = 60;
        water.scale.y = 10;
        water.position.x = 0;
        water.position.y = 0.1;
        water.position.z = 2;
        water.rotation.x = THREE.MathUtils.degToRad(-90);

        // give water material new vertex shader / fragment shader about water
        const waterFragmentShader = `
            uniform sampler2D diffuseTex;
            uniform sampler2D normalTex;
            uniform vec3 lightPosition;
            uniform vec3 ambient;
            uniform vec3 worldCameraPosition;
            uniform float glossiness;
            uniform float time;
            uniform vec2 repeat;

            varying mat3x3 toWorld;
            varying mat3x3 TBN;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;

            void main() {
                vec2 finalUV = vec2((vUV.x * 4.0) + time, vUV.y);
                vec3 diffuse = texture2D(diffuseTex, finalUV).rgb;

                vec3 worldLightDirection = vPosition - lightPosition;
                worldLightDirection = normalize(worldLightDirection);
            
                vec3 tanNormal = texture2D(normalTex, finalUV).rgb;
                tanNormal = tanNormal * 2.0 - 1.0;

                vec3 worldNormal = normalize(TBN * tanNormal);

                float nDotL = dot(worldNormal, -worldLightDirection);
                nDotL = max(nDotL, 0.0);
            
                vec3 worldViewDirection = normalize(worldCameraPosition - vPosition);
                vec3 worldHalfWayDirection = normalize(-worldLightDirection + worldViewDirection);
                
                float specular = 0.0;
                if (nDotL > 0.0)
                {
                    specular = pow(max(dot(worldNormal, worldHalfWayDirection), 0.0), glossiness * glossiness);
                }

                vec3 finalColor = ambient + diffuse * nDotL + specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }`;


        water.material.fragmentShader = waterFragmentShader;
        water.material.uniforms.diffuseTex.value = new THREE.TextureLoader().load("../assets/water.jpg", (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });
        water.material.uniforms.normalTex.value = new THREE.TextureLoader().load("../assets/water_normal.jpg", (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });

        this.scene.add(water);
        this.water = water;
        
        let loadedMesh = [];
        this.loadedMesh = loadedMesh;

        await this.loadFBX('../assets/Tree_average_regular.fbx', material, loadedMesh, ModelIndex.TREE1);
        await this.loadFBX('../assets/Tree_average_lush.fbx', material, loadedMesh, ModelIndex.TREE2);
        await this.loadFBX('../assets/Tree_Spruce_small_01.fbx', material, loadedMesh, ModelIndex.TREE3);
        await this.loadFBX('../assets/Tree_Spruce_tiny_01.fbx', material, loadedMesh, ModelIndex.TREE4);
        await this.loadFBX('../assets/Stone_average_01.fbx', material, loadedMesh, ModelIndex.ROCK1);
        await this.loadFBX('../assets/Stone_group_average.fbx', material, loadedMesh, ModelIndex.ROCK2);
        await this.loadFBX('../assets/Stump_average_flat.fbx', material, loadedMesh, ModelIndex.STUMP);
        await this.loadFBX('../assets/Log_big_knotty.fbx', material, loadedMesh, ModelIndex.LOG);
        await this.loadFBX('../assets/Bush_group_average.fbx', material, loadedMesh, ModelIndex.BUSH);
        await this.loadFBX('../assets/Mushroom_big_group_brown.fbx', material, loadedMesh, ModelIndex.MUSHROOM);
        await this.loadFBX('../assets/Flower_bush_blue.fbx', material, loadedMesh, ModelIndex.FLOWER);

        const tree1 = loadedMesh[ModelIndex.TREE1].clone();
        tree1.position.x = 18;
        tree1.position.z = 14;
        const tree2 = loadedMesh[ModelIndex.TREE2].clone();
        tree2.position.x = -2;
        tree2.position.z = 20;
        tree2.rotation.y = THREE.MathUtils.degToRad(68);
        const tree3 = loadedMesh[ModelIndex.TREE2].clone();
        tree3.position.x = -13;
        tree3.position.z = -21;
        const tree4 = loadedMesh[ModelIndex.TREE1].clone();
        tree4.position.x = 5;
        tree4.position.z = -27;
        tree4.rotation.y = THREE.MathUtils.degToRad(55);
        const tree5 = loadedMesh[ModelIndex.TREE3].clone();
        tree5.position.x = 27;
        tree5.position.z = -24;
        const tree6 = loadedMesh[ModelIndex.TREE4].clone();
        tree6.position.x = 24;
        tree6.position.z = -16;
        tree6.rotation.y = THREE.MathUtils.degToRad(45);
        const tree7 = loadedMesh[ModelIndex.TREE4].clone();
        tree7.position.x = 17;
        tree7.position.z = -23;
        tree7.rotation.y = THREE.MathUtils.degToRad(10);
        const tree8 = loadedMesh[ModelIndex.TREE3].clone();
        tree8.position.x = -24;
        tree8.position.z = 23;
        const tree9 = loadedMesh[ModelIndex.TREE4].clone();
        tree9.position.x = -16;
        tree9.position.z = 27;
        tree9.rotation.y = THREE.MathUtils.degToRad(35);
        const tree10 = loadedMesh[ModelIndex.TREE3].clone();
        tree10.position.x = -25;
        tree10.position.z = -10;
        tree10.rotation.y = THREE.MathUtils.degToRad(45);
        const rock1 = loadedMesh[ModelIndex.ROCK1].clone();
        rock1.position.x = 1;
        rock1.position.z = 15;
        rock1.rotation.y = THREE.MathUtils.degToRad(45);
        const rock2 = loadedMesh[ModelIndex.ROCK2].clone();
        rock2.position.x = 14;
        rock2.position.z = 12;
        rock2.rotation.y = THREE.MathUtils.degToRad(120);
        const rock3 = loadedMesh[ModelIndex.ROCK2].clone();
        rock3.position.x = -10;
        rock3.position.z = -10;
        rock3.rotation.y = THREE.MathUtils.degToRad(200);
        const rock4 = loadedMesh[ModelIndex.ROCK1].clone();
        rock4.position.x = 1;
        rock4.position.z = -18;
        rock4.rotation.y = THREE.MathUtils.degToRad(120);
        const stump1 = loadedMesh[ModelIndex.STUMP].clone();
        stump1.position.x = 10;
        stump1.position.z = -8;
        const stump2 = loadedMesh[ModelIndex.STUMP].clone();
        stump2.position.x = 23;
        stump2.position.z = 18;
        stump2.rotation.y = THREE.MathUtils.degToRad(45);
        const log1 = loadedMesh[ModelIndex.LOG].clone();
        log1.position.x = 1;
        log1.position.z = -9;
        log1.rotation.y = THREE.MathUtils.degToRad(50);
        const log2 = loadedMesh[ModelIndex.LOG].clone();
        log2.position.x = 23;
        log2.position.z = 24;
        log2.rotation.y = THREE.MathUtils.degToRad(23);
        const log3 = loadedMesh[ModelIndex.LOG].clone();
        log3.position.x = -11;
        log3.position.z = 13;
        log3.rotation.y = THREE.MathUtils.degToRad(140);
        const bush1 = loadedMesh[ModelIndex.BUSH].clone();
        bush1.position.x = -19;
        bush1.position.z = 15;
        const bush2 = loadedMesh[ModelIndex.BUSH].clone();
        bush2.position.x = 20;
        bush2.position.z = -11;
        bush2.rotation.y = THREE.MathUtils.degToRad(72);
        const bush3 = loadedMesh[ModelIndex.BUSH].clone();
        bush3.position.x = -5;
        bush3.position.z = -18;
        bush3.rotation.y = THREE.MathUtils.degToRad(100);
        const mushroom1 = loadedMesh[ModelIndex.MUSHROOM].clone();
        mushroom1.position.x = -5;
        mushroom1.position.z = 19;
        const mushroom2 = loadedMesh[ModelIndex.MUSHROOM].clone();
        mushroom2.position.x = 0;
        mushroom2.position.z = -10;
        mushroom2.rotation.y = THREE.MathUtils.degToRad(115);
        const mushroom3 = loadedMesh[ModelIndex.MUSHROOM].clone();
        mushroom3.position.x = 3;
        mushroom3.position.z = -24;
        const flower1 = loadedMesh[ModelIndex.FLOWER].clone();
        flower1.position.x = 8;
        flower1.position.z = -10;
        const flower2 = loadedMesh[ModelIndex.FLOWER].clone();
        flower2.position.x = 20;
        flower2.position.z = 9;
        const flower3 = loadedMesh[ModelIndex.FLOWER].clone();
        flower3.position.x = 25;
        flower3.position.z = 11;
        flower3.rotation.y = THREE.MathUtils.degToRad(33);
        const flower4 = loadedMesh[ModelIndex.FLOWER].clone();
        flower4.position.x = 24;
        flower4.position.z = 27;
        const flower5 = loadedMesh[ModelIndex.FLOWER].clone();
        flower5.position.x = 6;
        flower5.position.z = 25;
        flower5.rotation.y = THREE.MathUtils.degToRad(45);
        const flower6 = loadedMesh[ModelIndex.FLOWER].clone();
        flower6.position.x = -14;
        flower6.position.z = 20;
        const flower7 = loadedMesh[ModelIndex.FLOWER].clone();
        flower7.position.x = -25;
        flower7.position.z = 9;
        const flower8 = loadedMesh[ModelIndex.FLOWER].clone();
        flower8.position.x = 11;
        flower8.position.z = -25;
        flower8.rotation.y = THREE.MathUtils.degToRad(45);
        const flower9 = loadedMesh[ModelIndex.FLOWER].clone();
        flower9.position.x = 15;
        flower9.position.z = -15;
        flower9.rotation.y = THREE.MathUtils.degToRad(10);
        const flower10 = loadedMesh[ModelIndex.FLOWER].clone();
        flower10.position.x = 26;
        flower10.position.z = -6;
        const flower11 = loadedMesh[ModelIndex.FLOWER].clone();
        flower11.position.x = -12;
        flower11.position.z = -6;
        flower11.rotation.y = THREE.MathUtils.degToRad(30);
        const flower12 = loadedMesh[ModelIndex.FLOWER].clone();
        flower12.position.x = -25;
        flower12.position.z = -20;

        this.scene.add(tree1);
        this.scene.add(tree2);
        this.scene.add(tree3);
        this.scene.add(tree4);
        this.scene.add(tree5);
        this.scene.add(tree6);
        this.scene.add(tree7);
        this.scene.add(tree8);
        this.scene.add(tree9);
        this.scene.add(tree10);
        this.scene.add(rock1);
        this.scene.add(rock2);
        this.scene.add(rock3);
        this.scene.add(rock4);
        this.scene.add(stump1);
        this.scene.add(stump2);
        this.scene.add(log1);
        this.scene.add(log2);
        this.scene.add(log3);
        this.scene.add(bush1);
        this.scene.add(bush2);
        this.scene.add(bush3);
        this.scene.add(mushroom1);
        this.scene.add(mushroom2);
        this.scene.add(mushroom3);
        this.scene.add(flower1);
        this.scene.add(flower2);
        this.scene.add(flower3);
        this.scene.add(flower4);
        this.scene.add(flower5);
        this.scene.add(flower6);
        this.scene.add(flower7);
        this.scene.add(flower8);
        this.scene.add(flower9);
        this.scene.add(flower10);
        this.scene.add(flower11);
        this.scene.add(flower12);
    }
    processInput() {
    }
    update() {
        const delta = this.clock.getDelta();
        this.time += delta;

        this.lightOrbit.position.x = Math.cos(this.time / 2) * this.scale;
        this.lightOrbit.position.y = Math.sin(this.time / 2) * this.scale;
        this.lightOrbit.position.z = Math.sin(this.time / 4) * this.scale / 2;

        let lightOrbitWorldPosition = new THREE.Vector3();
        let cameraWorldPosition = new THREE.Vector3();

        this.lightOrbit.getWorldPosition(lightOrbitWorldPosition);
        this.camera.getWorldPosition(cameraWorldPosition);

        for (let i = 0; i < this.loadedMesh.length; ++i) {
            this.loadedMesh[i].material.uniforms.lightPosition.value = new THREE.Vector3().add(lightOrbitWorldPosition);
            this.loadedMesh[i].material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);
        }

        this.plane.material.uniforms.lightPosition.value = new THREE.Vector3().add(lightOrbitWorldPosition);
        this.plane.material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);

        this.water.material.uniforms.lightPosition.value = new THREE.Vector3().add(lightOrbitWorldPosition);
        this.water.material.uniforms.worldCameraPosition.value = new THREE.Vector3().add(cameraWorldPosition);
        this.water.material.uniforms.time.value = this.time;

        this.controls.update();
    }
    getDescription() {
        return `
        <h2>Camping</h2>
        <p></p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    async loadFBX(string, material, loadedMesh, index) {
        const fbxLoader = new FBXLoader()
        let group = await fbxLoader.loadAsync(
            string,
            
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        );

        group.children[0].material = material.clone();
        loadedMesh[index] = group.children[0];
    }
}