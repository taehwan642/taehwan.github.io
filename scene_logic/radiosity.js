import * as THREE from 'three';
import exampleScene from './exampleScene.js'

export default class radiosity extends exampleScene {
    mesh;
    // 1. input mesh, reflectance, emission factors
    // 2. subdivide mesh (patch divide)
    // 3. form factor calculation
    //  i. use render each hemicube's faces by the eye of patch (z buffer)
    //      a. at rendering, set pixel color to patch id (triangle id, mesh id)
    //      b. to set id, set like this : (meshid + 1, floor (i / 255), 
    //          i - (255 * floor (i / 255))), wile i = for loop to
    //          index array length / 3
    //      c. but use my own tri id, mesh id code
    //  ii. after getting the rendered screen by rendertarget, 
    //      the each pixel is going to represent tri id after calc
    //  iii. calculate form factors
    // 4. radiosity equation solving
    //  i. iterate?
    // 5. render

    initialize(clientWidth, clientHeight) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        this.camera.position.z = 500;
        this.camera.position.y = 50;
        this.camera.position.x = 150;

        const light = new THREE.AmbientLight( 0xffffff ); // soft white light
        this.scene.add( light );

        for (var i = 0; i < 19; ++i) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( this.getVerticesPosition(), 3 ) );
            geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( this.getNormal(i), 3 ) );
            geo.setIndex(this.getIndices(i));

            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(Math.random(), Math.random(), Math.random()),
            });

            const mesh = new THREE.Mesh(geo, material);
            this.mesh = mesh;
            this.scene.add(mesh)
        }

        console.log(this.scene);
    }
    processInput() {
    }
    update() {
    }
    getDescription() {
        return `
        <h2>Radiosity</h2>
        `;
    }

    getVerticesPosition() {
        return [
            0, 0, 0,
            216, 0, 0,
            216, 0, 215,
            0, 0, 215,
            0, 221, 0,
	        216, 221, 0,
	        216, 221, 215,
	        0, 221, 215,

	        85.5, 220, 90,
	        130.5, 220, 90,
	        130.5, 220, 130,
	        85.5, 220, 130,

	        53.104, 0, 64.104,
	        109.36, 0, 96.604,
	        76.896, 0, 152.896,
	        20.604, 0, 120.396,
	        53.104, 65, 64.104,
	        109.36, 65, 96.604,
	        76.896, 65, 152.896,
	        20.604, 65, 120.396,

	        134.104, 0, 67.104,
	        190.396, 0, 99.604,
	        157.896, 0, 155.896,
	        101.604, 0, 123.396,
	        134.104, 130, 67.104,
	        190.396, 130, 99.604,
	        157.896, 130, 155.896,
	        101.604, 130, 123.396
        ];
    }

    getIndices(modelIndex) {
        const indices = [];
        indices[0] = [4, 5, 6, 4, 6, 7];
        indices[1] = [0, 3, 2, 0, 2, 1];
        indices[2] = [0, 4, 7, 0, 7, 3];
        indices[3] = [0, 1, 5, 0, 5, 4];
        indices[4] = [2, 6, 5, 2, 5, 1];
        indices[5] = [2, 3, 7, 2, 7, 6];
        indices[6] = [8, 9, 10, 8, 10, 11];
        indices[7] = [16, 19, 18, 16, 18, 17];
        indices[8] = [12, 13, 14, 12, 14, 15];
        indices[9] = [12, 15, 19, 12, 19, 16];
        indices[10] = [12, 16, 17, 12, 17, 13];
        indices[11] = [14, 13, 17, 14, 17, 18];
        indices[12] = [14, 18, 19, 14, 19, 15];
        indices[13] = [24, 27, 26, 24, 26, 25];
        indices[14] = [20, 21, 22, 20, 22, 23];
        indices[15] = [20, 23, 27, 20, 27, 24];
        indices[16] = [20, 24, 25, 20, 25, 21];
        indices[17] = [22, 21, 25, 22, 25, 26];
        indices[18] = [22, 26, 27, 22, 27, 23];
        return indices[modelIndex];
    }

    getNormal(modelIndex) {
        const normals = [];
        normals[0] = [0, -1, 0];
        normals[1] = [0, -1, 0];
        normals[2] = [0, 1, 0];
        normals[3] = [1, 0, 0];
        normals[4] = [0, 0, 1];
        normals[5] = [-1, 0, 0];
        normals[6] = [0, 0,-1];
        normals[7] = [0, -1, 0];
        normals[8] = [0, 1, 0];
        normals[9] = [0, -1, 0];
        normals[10] = [-0.866, 0, -0.5];
        normals[11] = [0.5, 0, -0.866];
        normals[12] = [0.866, 0, 0.5];
        normals[13] = [-0.5, 0, 0.866];
        normals[14] = [0, 1, 0];
        normals[15] = [0, -1, 0];
        normals[16] = [-0.866, 0, -0.5];
        normals[17] = [0.5, 0, -0.866];
        normals[18] = [0.866, 0, 0.5];
        normals[19] = [-0.5, 0, 0.866];
        return normals[modelIndex];
    }
}
