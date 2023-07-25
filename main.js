import * as THREE from 'three';

const leftContainer = document.getElementById('left');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, leftContainer.clientWidth / leftContainer.clientHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
leftContainer.appendChild(renderer.domElement);


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
    camera.aspect = leftContainer.clientWidth / leftContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
}

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}

// Get all the dropdown items
const dropdownItems = document.querySelectorAll('.dropdown-content a')
// Add event listener to each dropdown item
dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the anchor from redirectin
        // Get the index of the clicked scene option
        const index = parseInt(item.getAttribute('data-index'))
        // Call the function to change the scene based on the index
        changeScene(index);
    });
});

function changeScene(index) {
    if (index == 0) {
        material.color.setHex(0xff0000);
    }
    else if (index == 1) {
        material.color.setHex(0xff00ff);
    }
}

// Example: Updating scene description and math
const descriptionElement = document.getElementById('description');
descriptionElement.innerHTML = `
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
    <h2>Scene Description</h2>
    <p>Your updated scene description goes here.</p>
    <p>Some other LaTex: \(E = mc^2\)</p>
`;
// Re-render math with MathJax after updating the content
MathJax.typesetPromise();

animate();
