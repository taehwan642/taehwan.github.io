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
        <p>Calculating diffuse light is very intuitive.</p>
        <p>In triangle, there's a perpendicular vector on triangle surface, and that's called normal vector.</p>
        <p>Usually normal vector's direction is calculated by triangle's indices order, that's called clockwise and counter-clockwise (CW / CCW)</p>
        <h2>Calculate normal</h2>
        <p>At first, you need to make the local space normal vector to world space normal vector, so you need to calculate it. but normal vector needs to be $1\\over scale$ sized to be perpendicular to scaled triangle surface. And if there's rotation, needs to apply it too.</p>
        <p>So you need to calculate with transposed inversed world matrix, and this is why.</p>
        <p>$$W = (S \\cdot R)$$</p>
        <p>$$W^{-1} = (S \\cdot R)^{-1} = R^{-1} \\cdot S^{-1}$$</p>
        <p>$$W^{-1 \\cdot T} = (R^{-1} \\cdot S^{-1})^T = S^{-1 \\cdot T} \\cdot R^{-1 \\cdot T}$$</p>
        <p>when $$R^{-1} = R^{T}, R^{-1 \\cdot T} = R$$ so</p>
        <p>$$W^{-1 \\cdot T} = S^{-1 \\cdot T} \\cdot R$$</p>
        <p>when $$S^{-1 \\cdot T} = S^{-1}$$ so</p>
        <p>$$W^{-1 \\cdot T} = S^{-1} \\cdot R$$</p>
        <h2>Calculate light</h2>
        <p>In pixel shader, get the light direction to your pixel, and dot product to get $\\cos(\\theta)$ that's the diffuse value.</p>
        <p>Why $\\cos$? it's because when the direction and normal's angle is narrow, the energy of the light must be higher compared with $\\theta > 45^\\circ$ or more angle. And $\\cos$ shows that.</p>
        <p>Also if the degree is higher than 90, then the light cannot directly reach to the triangle surface (only reachable with reflected light) so it should be darkest, 0 value.</p>
        <p>Get world light direction</p>
        <code>vec3 light = vPosition - lightPosition;</code>
        <code>light = normalize(light);</code>
        <p>Get world normal vector</p>        
        <code>vec3 normal = normalize((toWorld * vec4(vNormal, 0.0)).xyz);</code>
        <p>Dot product (Get $\\cos$ value) and if under 0, make it 0 (because $\\cos$ can be under 0, and brightness cannot go under 0)</p>
        <code>float dProd = max(0.0
                            dot(normal, -light));</code>
        <p>Set color with $\\cos$ value.</p>
        <code>gl_FragColor = vec4(dProd, dProd, dProd, 1.0);</code>
        <h3>Summarize</h3>
        <p>Diffuse light is bright when light direction and normal vector's angle is narrow, and goes dark when angle is large.</p>
        <p>$\\cos$ output is similar to above features, and vector dot product can gives us $\\cos (\\theta)$ value.</p>
        <p>We call this dot product as N dot L, "normal vector dot light direction". and after, we are going to use this N dot L at other lighting calculations too.</p>

        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
}