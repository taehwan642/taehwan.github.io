import * as THREE from 'three';
import exampleScene from './exampleScene.js'

class Vector3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    toList() {
        return [this.x, this.y, this.z];
    }
}

class ModelData {
    indices;
    normal;
    patchLevel;
    elementLevel;
    area;
    reflectance;
    emission;
    constructor(indices, normal, patchLevel, elementLevel, area, reflectance, emission) {
        this.indices = indices;
        this.normal = normal;
        this.patchLevel = patchLevel;
        this.elementLevel = elementLevel;
        this.area = area;
        this.reflectance = reflectance;
        this.emission = emission;
    }
}

class Patch {
    reflectance;
    emission;
    center;
    normal;
    unShotRadiosity;
    area;
    constructor(reflectance, emission, center, normal, unShotRadiosity, area) {
        this.reflectance = reflectance;
        this.emission = emission;
        this.center = center;
        this.normal = normal;
        this.unShotRadiosity = unShotRadiosity;
        this.area = area;
    }
}

class Element {
    mesh;
    indices;
    normal;
    radiosity;
    area;
    parentPatch;
    reflectance;
    constructor(mesh, indices, normal, radiosity, area, parentPatch, reflectance) {
        this.mesh = mesh;
        this.indices = indices;
        this.normal = normal;
        this.radiosity = radiosity;
        this.area = area;
        this.parentPatch = parentPatch;
        this.reflectance = reflectance;
    }
}

class RadiosityParameter {
    threshhold;
    patchCount;
    patches;
    elementCount;
    elements;
    pointCount;
    points;
    displayView;
    hemiCubeResolution;
    worldSize;
    intensityScale;
    addAmbient;
}

export default class radiosity extends exampleScene {
    elements;
    initialize(clientWidth, clientHeight) {
        const models = [];
        const subDiviedVertices = [];
        const patches = [];
        const elements = [];

        this.initModelDatas(models);
        let patchTotalCount = 0;
        for (let i = 0; i < 19; ++i) {
            patchTotalCount += models[i].patchLevel * models[i].patchLevel;
        }
        for (let i = 0; i < patchTotalCount; ++i) {
            patches[i] = new Patch();
        }

        let vertexOffset = 0;
        let patchesIndex = 0;
        let elementIndex = 0;
        for (let i = 0; i < 19; ++i) {
            const indexResult = this.subDivide(models[i], subDiviedVertices, patches, elements, vertexOffset, patchesIndex, elementIndex);
            vertexOffset = indexResult.vertexOffset;
            patchesIndex = indexResult.patchesIndex;
            elementIndex = indexResult.elementIndex;
            console.log(vertexOffset);
            console.log(patchesIndex);
            console.log(elementIndex);
        }

        console.log(subDiviedVertices);

        for (let i = 0; i < elements.length; ++i) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( subDiviedVertices, 3 ) );
            geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( elements[i].normal, 3 ) );
            geo.setIndex(elements[i].indices);

            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(elements[i].reflectance),
                wireframe: true,
            });

            const mesh = new THREE.Mesh(geo, material);

            elements[i].mesh = mesh;
        }
        this.elements = elements;


        this.initRadiosityParameter();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 1000 );

        this.camera.position.z = 700;
        this.camera.position.y = 50;
        this.camera.position.x = 150;

        for (var i = 0; i < elements.length; ++i) {
            this.scene.add(elements[i].mesh)
        }

        console.log(this.scene);
    }
    processInput() {
    }
    update() {
        for (let i = 0; i < this.elements.length; ++i) {
            this.elements[i].mesh.rotation.x += 0.01;
            this.elements[i].mesh.rotation.y += 0.01;
        }
    }
    getDescription() {
        return `
        <h2>Radiosity</h2>
        `;
    }

    getVerticesRawPosition() {
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

    getVerticesPosition() {
        return [
            new Vector3(0, 0, 0),
            new Vector3(216, 0, 0),
            new Vector3(216, 0, 215),
            new Vector3(0, 0, 215),
            new Vector3(0, 221, 0),
	        new Vector3(216, 221, 0),
	        new Vector3(216, 221, 215),
	        new Vector3(0, 221, 215),
	        new Vector3(85.5, 220, 90),
	        new Vector3(130.5, 220, 90),
	        new Vector3(130.5, 220, 130),
	        new Vector3(85.5, 220, 130),
	        new Vector3(53.104, 0, 64.104),
	        new Vector3(109.36, 0, 96.604),
	        new Vector3(76.896, 0, 152.896),
	        new Vector3(20.604, 0, 120.396),
	        new Vector3(53.104, 65, 64.104),
	        new Vector3(109.36, 65, 96.604),
	        new Vector3(76.896, 65, 152.896),
	        new Vector3(20.604, 65, 120.396),
	        new Vector3(134.104, 0, 67.104),
	        new Vector3(190.396, 0, 99.604),
	        new Vector3(157.896, 0, 155.896),
	        new Vector3(101.604, 0, 123.396),
	        new Vector3(134.104, 130, 67.104),
	        new Vector3(190.396, 130, 99.604),
	        new Vector3(157.896, 130, 155.896),
	        new Vector3(101.604, 130, 123.396)
        ];
    }

    initModelDatas(models) {
        const red = new THREE.Color( 0.80, 0.10, 0.075 );
        const yellow = new THREE.Color( 0.9, 0.8, 0.1 );
        const blue = new THREE.Color( 0.075, 0.10, 0.35 );
        const white = new THREE.Color( 1.0, 1.0, 1.0 );
        const lightGrey = new THREE.Color( 0.9, 0.9, 0.9 );
        const black = new THREE.Color( 0.0, 0.0, 0.0 );
        const lightGreen = new THREE.Color( 0.63, 0.85, 0.58 )

        models[0] = new ModelData([4, 5, 6, 4, 6, 7],           [0, -1, 0],         1, 3, (216 * 215),    lightGrey,    black);
        models[1] = new ModelData([0, 3, 2, 0, 2, 1],           [0, 1, 0],          1, 3, (216 * 215),    lightGrey,    black);
        models[2] = new ModelData([0, 4, 7, 0, 7, 3],           [1, 0, 0],          1, 3, (221 * 215),    red,          black);
        models[3] = new ModelData([0, 1, 5, 0, 5, 4],           [0, 0, 1],          1, 3, (221 * 216),    lightGrey,    black);
        models[4] = new ModelData([2, 6, 5, 2, 5, 1],           [-1, 0, 0],         1, 3, (221 * 215),    blue,         black);
        models[5] = new ModelData([2, 3, 7, 2, 7, 6],           [0, 0, -1],         1, 3, (221 * 216),    lightGrey,    black);
        models[6] = new ModelData([8, 9, 10, 8, 10, 11],        [0, -1, 0],         1, 3, (40 * 45),      black,        white);
        models[7] = new ModelData([16, 19, 18, 16, 18, 17],     [0, 1, 0],          1, 3, (65 * 65),      yellow,       black);
        models[8] = new ModelData([12, 13, 14, 12, 14, 15],     [0, -1, 0],         1, 3, (65 * 65),      yellow,       black);
        models[9] = new ModelData([12, 15, 19, 12, 19, 16],     [-0.866, 0, -0.5],  1, 3, (65 * 65),      yellow,       black);
        models[10] = new ModelData([12, 16, 17, 12, 17, 13],    [0.5, 0, -0.866],   1, 3, (65 * 65),      yellow,       black);
        models[11] = new ModelData([14, 13, 17, 14, 17, 18],    [0.866, 0, 0.5],    1, 3, (65 * 65),      yellow,       black);
        models[12] = new ModelData([14, 18, 19, 14, 19, 15],    [-0.5, 0, 0.866],   1, 3, (65 * 65),      yellow,       black);
        models[13] = new ModelData([24, 27, 26, 24, 26, 25],    [0, 1, 0],          1, 3, (65 * 65),      lightGreen,   black);
        models[14] = new ModelData([20, 21, 22, 20, 22, 23],    [0, -1, 0],         1, 3, (65 * 65),      lightGreen,   black);
        models[15] = new ModelData([20, 23, 27, 20, 27, 24],    [-0.866, 0, -0.5],  1, 3, (65 * 130),     lightGreen,   black);
        models[16] = new ModelData([20, 24, 25, 20, 25, 21],    [0.5, 0, -0.866],   1, 3, (65 * 130),     lightGreen,   black);
        models[17] = new ModelData([22, 21, 25, 22, 25, 26],    [0.866, 0, 0.5],    1, 3, (65 * 130),     lightGreen,   black);
        models[18] = new ModelData([22, 26, 27, 22, 27, 23],    [-0.5, 0, 0.866],   1, 3, (65 * 130),     lightGreen,   black);
    }

    convertUVtoPoint(vertices, u, v)
    {
        let point = new Vector3(
            vertices[0].x * (1 - u) * (1 - v) + vertices[1].x * (1 - u) * v + vertices[2].x * u * v + vertices[3].x * u * (1 - v),
            vertices[0].y * (1 - u) * (1 - v) + vertices[1].y * (1 - u) * v + vertices[2].y * u * v + vertices[3].y * u * (1 - v),
            vertices[0].z * (1 - u) * (1 - v) + vertices[1].z * (1 - u) * v + vertices[2].z * u * v + vertices[3].z * u * (1 - v),
        ); 
        return point;
    }

    subDivide(modelData, subDiviedVertices, patches, elements, vertexOffset, patchesIndex, elementIndex) {
        let quadVertices = [];
        let nu, nv;
        let	du, dv;
        let i, j;
        let u, v;
        let fi, fj;
        let pi, pj;
        let verticesCount = 0;

        quadVertices[0] = this.getVerticesPosition()[modelData.indices[0]];
        quadVertices[1] = this.getVerticesPosition()[modelData.indices[1]];
        quadVertices[2] = this.getVerticesPosition()[modelData.indices[2]];
        quadVertices[3] = this.getVerticesPosition()[modelData.indices[5]];

        // index is wrong. calculate index.
        // vertex calculation is wrong also. 3rd vtx.
        nu = modelData.patchLevel * modelData.elementLevel + 1;
        nv = modelData.patchLevel * modelData.elementLevel + 1;
        du = 1.0 / (nu - 1);
        dv = 1.0 / (nv - 1);
        for (i = 0, u = 0; i < nu; i++, u += du) {
            for (j = 0, v = 0; j < nv; j++, v += dv, verticesCount++) {
                console.log(du + " " + dv + " " + u + " " + v);
                subDiviedVertices.push(...this.convertUVtoPoint(quadVertices, u, v).toList());
            }
        }

        nu = modelData.patchLevel * modelData.elementLevel;
        nv = modelData.patchLevel * modelData.elementLevel;
        du = 1.0 / nu; dv = 1.0 / nv;
        for (i = 0, u = du / 2.0; i < nu; i++, u += du) {
            for (j = 0, v = dv / 2.0; j < nv; j++, v += dv, elementIndex++) {
                fi = i / nu;
                fj = j / nv;
                pi = Math.trunc(fi * (modelData.patchLevel));
                pj = Math.trunc(fj * (modelData.patchLevel));

                elements[elementIndex] = new Element(
                    null,
                    [
                        (i * (nv + 1) + j) + vertexOffset,
                        ((i + 1) * (nv + 1) + j) + vertexOffset,
                        ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset,
                        (i * (nv + 1) + j) + vertexOffset,
                        ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset,
                        (i * (nv + 1) + (j + 1)) + vertexOffset
                    ],
                    modelData.normal,
                    null,
                    modelData.area / (nu * nv),
                    patches[patchesIndex + pi * modelData.patchLevel + pj],
                    modelData.reflectance,
                );
                const idxarray = [
                    (i * (nv + 1) + j) + vertexOffset,
                    ((i + 1) * (nv + 1) + j) + vertexOffset,
                    ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset,
                    (i * (nv + 1) + j) + vertexOffset,
                    ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset,
                    (i * (nv + 1) + (j + 1)) + vertexOffset
                ];
                console.log(idxarray);
            }
        }

        /* Calculate patches */
        nu = modelData.patchLevel;
        nv = modelData.patchLevel;
        du = 1.0 / nu;
        dv = 1.0 / nv;
        for (i = 0, u = du / 2.0; i < nu; i++, u += du) {
            for (j = 0, v = dv / 2.0; j < nv; j++, v += dv, patchesIndex++) {
                patches[patchesIndex].center = this.convertUVtoPoint(quadVertices, u, v);
                patches[patchesIndex].normal = modelData.normal;
                patches[patchesIndex].reflectance = modelData.reflectance;
                patches[patchesIndex].emission = modelData.emission;
                patches[patchesIndex].area = modelData.area / (nu * nv);
            }
        }
        vertexOffset += verticesCount;

        return {
            vertexOffset: vertexOffset,
            patchesIndex: patchesIndex,
            elementIndex: elementIndex,
        };
    }

    initRadiosityParameter() {

    }

}
