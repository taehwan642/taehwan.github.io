import * as THREE from 'three';

export function runScene(renderer, clientWidth, clientHeight) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );
    
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame( animate );
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render( scene, camera );
    }
    animate();

    return { camera, material };
}