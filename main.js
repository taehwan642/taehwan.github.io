import * as THREE from 'three';
import local_space from './scene_logic/local_space.js'
import world_space from './scene_logic/world_space.js'
import texture from './scene_logic/texture.js'

let currentScene = null;
const exampleScenes = [ new local_space(), new world_space(), new texture() ];

const leftContainer = document.getElementById('left');

const renderer = new THREE.WebGLRenderer();
renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
leftContainer.appendChild(renderer.domElement);

let material = undefined;

function initialize() {
    currentScene = exampleScenes[0];
    currentScene.initialize(leftContainer.clientWidth, leftContainer.clientHeight);
    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = currentScene.getDescription();
    // Re-render math with MathJax after updating the content
    MathJax.typesetPromise();
}

function gameLoop() {
    requestAnimationFrame( gameLoop );
    currentScene.processInput();
    currentScene.update();
    renderer.render( currentScene.scene, currentScene.camera );
}

function onWindowResize() {
    currentScene.camera.aspect = leftContainer.clientWidth / leftContainer.clientHeight;
    currentScene.camera.updateProjectionMatrix();
    renderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
}
window.addEventListener( 'resize', onWindowResize, false );

function changeScene(index) {
    currentScene = exampleScenes[index];
    currentScene.initialize(leftContainer.clientWidth, leftContainer.clientHeight);
    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = currentScene.getDescription();
    // Re-render math with MathJax after updating the content
    MathJax.typesetPromise();
}

// scene list
// currentscene = get scene 0
// currentscene initialize
// currentscene getcamera
// currentscene getscene
// render

// if changescene
// removecurrentscene
// initialize
// render

// model 
// - stanford bunny
// - suzanne

// Get the dropdown and its content
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

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

initialize();
gameLoop();
