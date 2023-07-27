import * as THREE from 'three';
import exampleScene from './exampleScene.js'

export default class lighting extends exampleScene {
    torusknot;
    cube;

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        const geometry = new THREE.TorusKnotGeometry();
        const textureLoader = new THREE.TextureLoader();
        const map = textureLoader.load("../assets/leaves_01_diffuse.jpg", (texture) => {
            // 이미지 반복 맵핑
            // RepeatWrapping: 이미지를 반복해서 맵핑
            // ClampToEdgeWrapping: 처음에만 이미지가 한 번 맵핑되고, 이후 반복부터는 이미지의 끝단 픽셀로 나머지 영역을 채움
            // MirroredRepeatWrapping: 이미지를 x와 y 방향으로 반복하되, 짝수번째 반복에서는 이미지가 거울에 반사되어 뒤집힌 모양으로 맵핑됨

            texture.offset.x = 0; // UV 좌표의 시작 위치 조정
            texture.offset.y = 0;

            texture.magFilter = THREE.LinearFilter; // 이미지의 원래 크기보다 화면에 더 크게 확대되어 랜더링
            texture.minFilter = THREE.NearestMipMapLinearFilter; // 이미지의 원래 크기보다 화면에 더 작게 확대되어 랜더링
        });
        const material = new THREE.MeshStandardMaterial({
            map: map,
        });

        const torusknot = new THREE.Mesh( geometry, material );
        this.torusknot = torusknot;
        this.torusknot.position.x = -2;
        this.scene.add( torusknot );
        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( light );
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1) // soft white light
        this.scene.add( directionalLight );

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cube = new THREE.Mesh( cubeGeometry, material );
        this.cube = cube;
        this.cube.position.x = 2;
        this.scene.add ( cube );
        
        this.camera.position.z = 5;
    }
    processInput() {
    }
    update() {
        this.torusknot.rotation.x += 0.01;
        this.torusknot.rotation.y += 0.01;
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }
    getDescription() {
        return `
        <h2>Lighting</h2>
        <p> Phong </p>
        <p> Ambient + Specular + Diffuse </p>
        `;
    }
}