import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
    toThreeVector() {
        return new THREE.Vector3(this.x, this.y, this.z);
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
    threshold;
    view;
    hemiCubeResolution;
    worldSize;
    intensityScale;
    addAmbient;
    constructor(threshold, view, hemiCubeResolution, worldSize, intensityScale, addAmbient) {
        this.threshold = threshold;
        this.view = view;
        this.hemiCubeResolution = hemiCubeResolution;
        this.worldSize = worldSize;
        this.intensityScale = intensityScale;
        this.addAmbient = addAmbient;
    }
}

class View {
    center;
    lookAt;
    up;
    fovX;
    fovY;
    near;
    far;
    resolutionX;
    resolutionY;
    buffer;
    constructor(center, lookAt, up, fovX, fovY, near, far, resolutionX, resolutionY, buffer) {
        this.center = center;
        this.lookAt = lookAt;
        this.up = up;
        this.fovX = fovX;
        this.fovY = fovY;
        this.near = near;
        this.far = far;
        this.resolutionX = resolutionX;
        this.resolutionY = resolutionY;
        this.buffer = buffer;
    }
}

class HemiCube {
    view;
    topFactors;
    sideFactors;
    constructor(view, topFactors, sideFactors) {
        this.view = view;
        this.topFactors = topFactors;
        this.sideFactors = sideFactors;
    }
}

export default class radiosity extends exampleScene {
    renderer;
    
    models;
    patches;
    elements;
    radiosityParameter;
    hemiCube;
    formFactors;
    totalEnergy;

    hemiCubeRenderTarget;
    hemiCubeRenderMesh;
    hemiCubeRenderCamera;
    hemiCubeRenderScene;
    hemiCubeCameraHelper;

    readBuffer;

    initialize(clientWidth, clientHeight) {
        const models = [];
        this.models = models;
        const subDiviedVertices = [];
        const patches = [];
        this.patches = patches;
        const elements = [];
        this.elements = elements;
        const radiosityParameter = new RadiosityParameter(
            0.0001,
            new View(
                new Vector3(150, 50, 700),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0),
                60, 60,
                1, 550,
                200, 200,
                null),
            100,
            250,
            50,
            1
        );
        this.radiosityParameter = radiosityParameter;
        const hemiCubeResolution = (Math.trunc((radiosityParameter.hemiCubeResolution / 2) + 0.5) * 2);
        const hemiCube = new HemiCube(
            new View(
                new Vector3(0, 0, 1),
                new Vector3(0, 0, 0),
                new Vector3(0, 1, 0),
                90, 90,
                radiosityParameter.worldSize * 0.001,
                radiosityParameter.worldSize,
                hemiCubeResolution,
                hemiCubeResolution,
                []),
            this.makeTopFactors(hemiCubeResolution / 2),
            this.makeSideFactors(hemiCubeResolution / 2)
        );
        this.hemiCube = hemiCube;

        this.hemiCubeRenderCamera = new THREE.PerspectiveCamera(
            this.hemiCube.view.fovX, 
            this.hemiCube.view.fovX / this.hemiCube.view.fovY,
            this.hemiCube.view.near,
            this.hemiCube.view.far);

        this.readBuffer = new Uint8Array( hemiCube.view.resolutionX * hemiCube.view.resolutionY * 4 );

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
        }

        this.formFactors = [];
        for (let i = 0; i < this.elements.length; ++i) {
	    	this.formFactors[i] = 0;
        }

        const totalEnergy = this.initRadiosityParameter(patches, elements);
        this.totalEnergy = totalEnergy;


        const rtSize = new THREE.Vector2(hemiCube.view.resolutionX, hemiCube.view.resolutionY);
        this.hemiCubeRenderTarget = new THREE.WebGLRenderTarget(
            rtSize.width, rtSize.height, 
        );

        this.hemiCubeRenderScene = new THREE.Scene();

        this.initRenderTarget(radiosityParameter, hemiCube);

        for (let i = 0; i < elements.length; ++i) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( subDiviedVertices, 3 ) );
            geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( elements[i].normal, 3 ) );
            geo.setIndex(elements[i].indices);

            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(elements[i].radiosity.r, elements[i].radiosity.g, elements[i].radiosity.b),
            });

            const mesh = new THREE.Mesh(geo, material);

            elements[i].mesh = mesh;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, clientWidth / clientHeight, 0.1, 2000 );
        this.camera.layers.enable(0);
        this.camera.layers.enable(1);

        this.camera.position.x = 150;
        this.camera.position.y = 50;
        this.camera.position.z = 700;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.update();

        this.controls = controls;

        for (var i = 0; i < elements.length; ++i) {
            this.scene.add(elements[i].mesh)
        }

        for (var i = 0; i < this.models.length; ++i) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( this.getVerticesRawPosition(), 3 ) );
            geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( this.models[i].normal, 3 ) );
            geo.setIndex(this.models[i].indices);

            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(this.models[i].reflectance.r, this.models[i].reflectance.g, this.models[i].reflectance.b),
            });

            const mesh = new THREE.Mesh(geo, material);
            mesh.layers.set(1);
            mesh.position.x = 300;
            mesh.position.z = -300;
            
            this.scene.add(mesh)
        }

        const geometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            map: this.hemiCubeRenderTarget.texture,
        })

        const mesh = new THREE.Mesh(geometry, material);
        mesh.layers.set(1);
        mesh.position.x = 400;
        mesh.position.y = 400;

        this.hemiCubeCameraHelper = new THREE.CameraHelper( this.hemiCubeRenderCamera );
        this.hemiCubeCameraHelper.layers.set(1);
        //this.scene.add(this.hemiCubeCameraHelper);
        this.scene.add(mesh);
    }
    processInput() {
        const self = this;
        document.onkeydown = function(e) {
            switch (e.key) {
              case "q":
                // self.renderer.setRenderTarget(self.hemiCubeRenderTarget);
                // self.doOneIteration();
        
                // self.renderer.setRenderTarget(null);
                // self.renderer.setClearColor(0x404040);
        
                // for (let i = 0; i < self.elements.length; ++i) {
                //     self.elements[i].mesh.material.color = new THREE.Color(self.elements[i].radiosity.r * self.radiosityParameter.intensityScale, self.elements[i].radiosity.g * self.radiosityParameter.intensityScale, self.elements[i].radiosity.b * self.radiosityParameter.intensityScale);
                // }
                // for (let i = 0; i < self.elements.length; ++i) {
                //     self.elements[i].mesh.rotation.y += 0.05;
                // }
                break;
              default:
                break;
            }
          };
    }
    update() {
        this.controls.update();
        this.renderer.setRenderTarget(this.hemiCubeRenderTarget);
        this.doOneIteration();
        
        this.renderer.setRenderTarget(null);
        this.renderer.setClearColor(0x404040);
        
        for (let i = 0; i < this.elements.length; ++i) {
            this.elements[i].mesh.material.color = new THREE.Color(this.elements[i].radiosity.r * this.radiosityParameter.intensityScale, this.elements[i].radiosity.g * this.radiosityParameter.intensityScale, this.elements[i].radiosity.b * this.radiosityParameter.intensityScale);
        }
    }
    getDescription() {
        return `
        <h2>Radiosity</h2>
        <p>$$F_{ij}=\\int_{A_j}{\\cos(\\phi_i)\\cos(\\phi_j)dA_j \\over \\pi r^2}$$<\p>
        `;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
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

        models[0] = new ModelData([4, 5, 6, 4, 6, 7],           [0, -1, 0],         2, 8, (216 * 215),    lightGrey,    black);
        models[1] = new ModelData([0, 3, 2, 0, 2, 1],           [0, 1, 0],          3, 8, (216 * 215),    lightGrey,    black);
        models[2] = new ModelData([0, 4, 7, 0, 7, 3],           [1, 0, 0],          2, 8, (221 * 215),    red,          black);
        models[3] = new ModelData([0, 1, 5, 0, 5, 4],           [0, 0, 1],          2, 8, (221 * 216),    lightGrey,    black);
        models[4] = new ModelData([2, 6, 5, 2, 5, 1],           [-1, 0, 0],         2, 8, (221 * 215),    blue,         black);
        models[5] = new ModelData([2, 3, 7, 2, 7, 6],           [0, 0, -1],         2, 8, (221 * 216),    lightGrey,    black);
        models[6] = new ModelData([8, 9, 10, 8, 10, 11],        [0, -1, 0],         2, 1, (40 * 45),      black,        white);
        models[7] = new ModelData([16, 19, 18, 16, 18, 17],     [0, 1, 0],          1, 5, (65 * 65),      yellow,       black);
        models[8] = new ModelData([12, 13, 14, 12, 14, 15],     [0, -1, 0],         1, 1, (65 * 65),      yellow,       black);
        models[9] = new ModelData([12, 15, 19, 12, 19, 16],     [-0.866, 0, -0.5],  1, 5, (65 * 65),      yellow,       black);
        models[10] = new ModelData([12, 16, 17, 12, 17, 13],    [0.5, 0, -0.866],   1, 5, (65 * 65),      yellow,       black);
        models[11] = new ModelData([14, 13, 17, 14, 17, 18],    [0.866, 0, 0.5],    1, 5, (65 * 65),      yellow,       black);
        models[12] = new ModelData([14, 18, 19, 14, 19, 15],    [-0.5, 0, 0.866],   1, 5, (65 * 65),      yellow,       black);
        models[13] = new ModelData([24, 27, 26, 24, 26, 25],    [0, 1, 0],          1, 5, (65 * 65),      lightGreen,   black);
        models[14] = new ModelData([20, 21, 22, 20, 22, 23],    [0, -1, 0],         1, 1, (65 * 65),      lightGreen,   black);
        models[15] = new ModelData([20, 23, 27, 20, 27, 24],    [-0.866, 0, -0.5],  1, 6, (65 * 130),     lightGreen,   black);
        models[16] = new ModelData([20, 24, 25, 20, 25, 21],    [0.5, 0, -0.866],   1, 6, (65 * 130),     lightGreen,   black);
        models[17] = new ModelData([22, 21, 25, 22, 25, 26],    [0.866, 0, 0.5],    1, 6, (65 * 130),     lightGreen,   black);
        models[18] = new ModelData([22, 26, 27, 22, 27, 23],    [-0.5, 0, 0.866],   1, 6, (65 * 130),     lightGreen,   black);
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

        nu = modelData.patchLevel * modelData.elementLevel + 1;
        nv = modelData.patchLevel * modelData.elementLevel + 1;
        du = 1.0 / (nu - 1);
        dv = 1.0 / (nv - 1);
        for (i = 0, u = 0; i < nu; i++, u += du) {
            for (j = 0, v = 0; j < nv; j++, v += dv, verticesCount++) {
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
                        ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset,
                        ((i + 1) * (nv + 1) + j) + vertexOffset,
                        (i * (nv + 1) + j) + vertexOffset,
                        (i * (nv + 1) + (j + 1)) + vertexOffset,
                        ((i + 1) * (nv + 1) + (j + 1)) + vertexOffset
                    ],
                    [...modelData.normal],
                    null,
                    modelData.area / (nu * nv),
                    patches[patchesIndex + pi * modelData.patchLevel + pj],
                    modelData.reflectance.clone(),
                );
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
                patches[patchesIndex].normal = [...modelData.normal];
                patches[patchesIndex].reflectance = modelData.reflectance.clone();
                patches[patchesIndex].emission = modelData.emission.clone();
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

    makeTopFactors(halfResolution) {
        const PI = 3.1415926;
        let j, k;
        let xSq , ySq, xy1Sq;
        let n = halfResolution;
        let wp = [];
        let dj, dk;
        let index = 0;

        for (j = 0; j < halfResolution; j++)
        {
            dj = j;
            ySq = (n - (dj + 0.5)) / n;
            ySq *= ySq;
            for (k = 0 ; k < halfResolution; k++)
            {
                dk = k;
                xSq = ( n - (dk + 0.5) ) / n;
                xSq *= xSq;
                xy1Sq =  xSq + ySq + 1.0 ;
                xy1Sq *= xy1Sq;
                wp[index++] = 1.0 / (xy1Sq * PI * n * n);
            }
        }

        return wp;
    }

    makeSideFactors(halfResolution) {
        const PI = 3.1415926;
        let j,k;
        let x, xSq , y, ySq, xy1, xy1Sq;
	    let n = halfResolution;
	    let wp = [];
	    let dj, dk;
        let index = 0;
        
	    for (j = 0; j < halfResolution; j++)
	    {
	    	dj = j;
	    	y = (n - (dj+0.5)) / n;
           	ySq = y * y;
           	for (k = 0; k < halfResolution; k++)
           	{
	    		dk = k;
           		x = ( n - (dk + 0.5) ) / n;
	    		xSq = x * x;
	    		xy1 =  xSq + ySq + 1.0 ;
	    		xy1Sq = xy1 * xy1;
            	wp[index++] = y / (xy1Sq * PI * n * n);
           	}
        }

        return wp;
    }

    initRadiosityParameter(patches, elements) {
        /* initialize radiosity */
        for (let i = 0; i < patches.length; ++i) {
            patches[i].unShotRadiosity = patches[i].emission.clone();
        }

        for (let i = 0; i < elements.length; ++i) {
            elements[i].radiosity = elements[i].parentPatch.emission.clone();
        }

        /* compute total energy */
        let totalEnergy = 0;
        for (let i = 0; i < patches.length; ++i) {
            totalEnergy += patches[i].emission.r * patches[i].area;
            totalEnergy += patches[i].emission.g * patches[i].area;
            totalEnergy += patches[i].emission.b * patches[i].area;
        }
        return totalEnergy;
    }

    initRenderTarget(radiosityParameter, hemiCube) {
        // init render target based of hemicube size
        // and hemicube.view.buffer is the read buffer of the render target
        // need to check how render target read buffer saves data
        // 1. [r, g, b, r, g, b]
        // 2. [r | g | b, r | g | b]
    }

    doOneIteration()
    {	
        let findResult = this.findShootPatch();
        if (findResult.found) 
        {
            console.log(findResult.shootPatchIndex);
            this.computeFormFactors(findResult.shootPatchIndex);
            this.distributeRadiosity(findResult.shootPatchIndex);
            return 0;
        }

        console.log("Radiosity done \n");
        return 1;
    }

    findShootPatch() {
        let shootPatchIndex = 0;
        let energySum, error, maxEnergySum = 0;
    
        for (let i = 0; i < this.patches.length; i++)
        {
            energySum = 0;
            energySum += this.patches[i].unShotRadiosity.r * this.patches[i].area;
            energySum += this.patches[i].unShotRadiosity.g * this.patches[i].area;
            energySum += this.patches[i].unShotRadiosity.b * this.patches[i].area;
            
            if (energySum > maxEnergySum) 
            {
                shootPatchIndex = i;
                maxEnergySum = energySum;
            }
        }

        error = maxEnergySum / this.totalEnergy;
        return {
            shootPatchIndex: shootPatchIndex,
            found: !(error < this.radiosityParameter.threshold)
        }
    }

    sumFormFactors(formFactors, resolutionX, resolutionY, buffer, deltaFactors, startY) {
        let i, j;
        let ii, jj;
        let halfResolution = resolutionX / 2;
        let current_backItem;
        current_backItem = 16777215;
        for (i = startY; i < resolutionY; i++) {
            ii = (i < halfResolution ? i : (halfResolution - 1 - (i % halfResolution))) * halfResolution;
            for (j = 0; j < resolutionX; j++) {
                if (buffer[i * resolutionX + j] != current_backItem)  
                {
                    //console.log((i * resolutionX + j) + " " + (buffer[i * resolutionX + j]));
                    jj = (j < halfResolution ? j : (halfResolution - 1 - (j % halfResolution)));
                    formFactors[buffer[i * resolutionX + j]] += deltaFactors[ii + jj];
                }
            }
        }
    }

    beginDrawHemiCube(planeEquation) {

        /* clear the frame buffer with color */
        this.renderer.setClearColor(new THREE.Color(1, 1, 1));
        this.renderer.clear();
      
        this.hemiCubeRenderCamera.position.x = this.hemiCube.view.center.x;
        this.hemiCubeRenderCamera.position.y = this.hemiCube.view.center.y;
        this.hemiCubeRenderCamera.position.z = this.hemiCube.view.center.z;

        this.hemiCubeRenderCamera.up.x = this.hemiCube.view.up.x;
        this.hemiCubeRenderCamera.up.y = this.hemiCube.view.up.y;
        this.hemiCubeRenderCamera.up.z = this.hemiCube.view.up.z;

        this.hemiCubeRenderCamera.lookAt(new THREE.Vector3(this.hemiCube.view.lookAt.x, this.hemiCube.view.lookAt.y, this.hemiCube.view.lookAt.z));
        
        this.hemiCubeCameraHelper.update();
        
        this.hemiCubeRenderCamera.updateProjectionMatrix();
    }

    drawHemiCubeElement(element, index) {
        element.mesh.material.color = new THREE.Color(Math.trunc(index / 65536) / 255, Math.trunc((index % 65536) / 256) / 255, Math.trunc(index % 256) / 255);
        //console.log(index + " " + Math.trunc(index / 65536) + " " + Math.trunc((index % 65536) / 256) + " " + Math.trunc(index % 256));
    }

    endDrawHemiCube() {
        this.renderer.readRenderTargetPixels( this.hemiCubeRenderTarget, 0, 0, this.hemiCube.view.resolutionX, this.hemiCube.view.resolutionY, this.readBuffer );
        let newBuffer = [];
        let newBufferIndex = 0;
        let index = 0;
        for (let i = 0; i < this.readBuffer.length; ++i) {
            if (index == 3) {
                index = 0;
                continue;
            }
            newBuffer[newBufferIndex] = this.readBuffer[i];
            ++newBufferIndex;
            ++index;
        }

        for (let j = 0; j < this.hemiCube.view.resolutionY; ++j) {
            for (let i = 0; i < this.hemiCube.view.resolutionX; ++i) {
                // r g b a
                this.hemiCube.view.buffer[i * this.hemiCube.view.resolutionY + j] =
                    (newBuffer[i * 3 * this.hemiCube.view.resolutionY + j * 3] * 65536) + 
                    (newBuffer[i * 3 * this.hemiCube.view.resolutionY + j * 3 + 1] * 256) +
                    (newBuffer[i * 3 * this.hemiCube.view.resolutionY + j * 3 + 2]);

                // console.log((i * 3 * this.hemiCube.view.resolutionY + j * 4) + " " +
                // (i * 3 * this.hemiCube.view.resolutionY + j * 4 + 1) + " " +
                // (i * 3 * this.hemiCube.view.resolutionY + j * 4 + 2));
            }
        }
    }

    computeFormFactors(shootPatchIndex) {
        let shootPatch = this.patches[shootPatchIndex];

        let	up = []; 
        let lookAt = [];
        let	center = new THREE.Vector3(shootPatch.center.x, shootPatch.center.y, shootPatch.center.z);
        let	normal = new THREE.Vector3(shootPatch.normal[0], shootPatch.normal[1], shootPatch.normal[2]);
        let tangentU = new THREE.Vector3();
        let tangentV = new THREE.Vector3();
        let vec = new THREE.Vector3(0, 0, 0);
        let	norm = 0;

        
        const planeEquation = [];
        planeEquation[0] = shootPatch.normal[0];
        planeEquation[1] = shootPatch.normal[1];
        planeEquation[2] = shootPatch.normal[2];
        planeEquation[3] = -(shootPatch.normal[0] * shootPatch.center.x + shootPatch.normal[1] * shootPatch.center.y +
            shootPatch.normal[2] * shootPatch.center.z);

        do {
            vec.x = Math.random();
            vec.y = Math.random();
            vec.z = Math.random();
            tangentU.crossVectors(normal, vec);
            norm = tangentU.length();
            tangentU.normalize();
        } while(norm == 0)
        //console.log(vec);
        //console.log(normal);
        //console.log(tangentU);
        tangentV.crossVectors(normal, tangentU);
        //console.log(tangentV);

        lookAt[0] = new THREE.Vector3().addVectors(center, normal);
        up[0] = tangentU;
        lookAt[1] = new THREE.Vector3().addVectors(center, tangentU);
        up[1] = normal.clone();
        lookAt[2] = new THREE.Vector3().addVectors(center, tangentV);
        up[2] = normal.clone();
        lookAt[3] = new THREE.Vector3().subVectors(center, tangentU);
        up[3] = normal.clone();
        lookAt[4] = new THREE.Vector3().subVectors(center, tangentV);
        up[4] = normal.clone();

        normal.multiplyScalar(this.radiosityParameter.worldSize * 0.00000001);
        this.hemiCube.view.center.x = center.x + normal.x;
        this.hemiCube.view.center.y = center.y + normal.y;
        this.hemiCube.view.center.z = center.z + normal.z;

        //console.log(lookAt);
        //console.log(up);

	    // /* clear the formfactors */
	    for (let i = 0; i < this.formFactors.length; ++i) {
	    	this.formFactors[i] = 0;
        }

        for (let face = 0; face < 5; ++face) {

            this.hemiCube.view.lookAt = lookAt[face].clone();
            this.hemiCube.view.up = up[face].clone();

            this.beginDrawHemiCube(planeEquation);
            for (let i = 0; i < this.elements.length; ++i) {
                this.drawHemiCubeElement(this.elements[i], i);
            }
            this.renderer.render(this.scene, this.hemiCubeRenderCamera);
            this.endDrawHemiCube();
            
            //console.log(this.hemiCube.view.buffer);

            if (face == 0) {
                this.sumFormFactors(this.formFactors, this.hemiCube.view.resolutionX, this.hemiCube.view.resolutionY, this.hemiCube.view.buffer, this.hemiCube.topFactors, 0);
            } else {
                this.sumFormFactors(this.formFactors, this.hemiCube.view.resolutionX, this.hemiCube.view.resolutionY, this.hemiCube.view.buffer, this.hemiCube.sideFactors, this.hemiCube.view.resolutionY / 2);
            }
        }

        for (let i = 0; i < this.elements.length; ++i) {
            this.formFactors[i] *= shootPatch.area / this.elements[i].area;

            if (this.formFactors[i] > 1.0) {
                this.formFactors[i] = 1.0;
            }
        }
    }

    distributeRadiosity(shootPatchIndex) {
        let deltaRad = new THREE.Color(0, 0, 0);
        let w;
    
        let shootPatch = this.patches[shootPatchIndex];
        
        for (let i = 0; i < this.elements.length; ++i) {
            if (this.formFactors[i] != 0) {
                deltaRad.r = shootPatch.unShotRadiosity.r * this.formFactors[i] * this.elements[i].parentPatch.reflectance.r;
                deltaRad.g = shootPatch.unShotRadiosity.g * this.formFactors[i] * this.elements[i].parentPatch.reflectance.g;
                deltaRad.b = shootPatch.unShotRadiosity.b * this.formFactors[i] * this.elements[i].parentPatch.reflectance.b;
                /* incremental element's radiosity and patch's unshot radiosity */
                w = this.elements[i].area / this.elements[i].parentPatch.area;

                this.elements[i].radiosity.r += deltaRad.r;
                this.elements[i].radiosity.g += deltaRad.g;
                this.elements[i].radiosity.b += deltaRad.b;
                this.elements[i].parentPatch.unShotRadiosity.r += deltaRad.r * w;
                this.elements[i].parentPatch.unShotRadiosity.g += deltaRad.g * w;
                this.elements[i].parentPatch.unShotRadiosity.b += deltaRad.b * w;
            }
        }
        /* reset shooting patch's unshot radiosity */
        shootPatch.unShotRadiosity = new THREE.Color(0, 0, 0);
    }
}
