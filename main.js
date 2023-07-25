import * as THREE from 'three';
import { runScene } from './scene_logic/scene1';

const leftContainer = document.getElementById('left');

const renderer = new THREE.WebGLRenderer();
renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
leftContainer.appendChild(renderer.domElement);

let camera = undefined;
let material = undefined;

function onWindowResize() {
    camera.aspect = leftContainer.clientWidth / leftContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
}
window.addEventListener( 'resize', onWindowResize, false );

// Get the dropdown and its content
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');
const sceneRunners = [runScene];

// Get all the dropdown items
const dropdownItems = document.querySelectorAll('.dropdown-content a')
// Add event listener to each dropdown item
dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the anchor from redirecting

        // Get the index of the clicked scene option
        const index = parseInt(item.getAttribute('data-index'));

        // Call the function to change the scene based on the index
        changeScene(index);

        // Close the dropdown after selecting a scene option
        dropdownContent.classList.remove('show');
    });
});

// Toggle the dropdown content visibility when clicking the dropdown button
dropdown.addEventListener('click', function(event) {
    dropdownContent.classList.toggle('show');
});

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', function(event) {
    if (!dropdown.contains(event.target)) {
        dropdownContent.classList.remove('show');
    }
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
    <p>Your scene description goes here.</p>
    <p>Some LaTex: \(x = \\frac {{-b \\pm \\sqrt{{b^2-4ac}}}}{{2a}}\)</p>
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

let retValue = runScene(renderer, leftContainer.clientWidth, leftContainer.clientHeight);
camera = retValue.camera;
material = retValue.material;