import React from "react"
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Mesh, Color3, StandardMaterial, WebXRState, WebXRFeatureName } from "@babylonjs/core"
import SceneComponent from "./SceneComponent"

function setupCameraForCollisions(camera) {
    camera.checkCollisions = true
    camera.applyGravity = true
    camera.ellipsoid = new Vector3(1, 1, 1)
}

const onSceneReady = async (scene) => {

    scene.gravity = new Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true

    console.log(WebXRFeatureName)

    var camera = new FreeCamera("camera1", new Vector3(0, 2.5, -6), scene);
    const canvas = scene.getEngine().getRenderingCanvas();

    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    setupCameraForCollisions(camera);

    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
    light.intensity = 0.7;
    var sphere = MeshBuilder.CreateSphere("sphere1", {segments: 16, diameter: 1}, scene)
    sphere.position.y = 1.25;

    const ground1 = MeshBuilder.CreateGround('ground1', {width: 20, height: 14}, scene)
    ground1.position.y = 0;  
    ground1.checkCollisions = true;

    //Simple crate
    var box = MeshBuilder.CreateBox("crate", {size: 2}, scene);
    box.position = new Vector3(5, 1, 5);
    box.checkCollisions = true;

    const orangeMaterial = new StandardMaterial('orangeMat', scene);
    orangeMaterial.specularColor = Color3.Black();
    orangeMaterial.emissiveColor = Color3.FromHexString('#FFAF00');

    const greenMaterial = new StandardMaterial('greenMat', scene);
    greenMaterial.specularColor = Color3.Black();
    greenMaterial.emissiveColor = Color3.Green();

    const redMaterial = new StandardMaterial('redMat', scene);
    redMaterial.specularColor = Color3.Black();
    redMaterial.emissiveColor = Color3.Red();

    const ground2 = MeshBuilder.CreateGround('ground2', {width: 4, height: 3}, scene);
    ground2.position.y = 0.25;
    ground2.material = greenMaterial;

    const ground3 = MeshBuilder.CreateGround('ground3', {width: 3, height: 3}, scene);
    ground3.position.y = 0.5;
    ground3.material = orangeMaterial;

    const ground4 = MeshBuilder.CreateGround('ground4', {width: 2, height: 2}, scene);
    ground4.position.y = 0.75;
    ground4.material = redMaterial;

    const triangle = MeshBuilder.CreateCylinder("triangle", {
        tessellation: 3, height: 0.1, subdivisions: 4, diameterTop: 1, diameterBottom: 1
    }, scene)

    const triangleMaterial = new StandardMaterial('triangle-mat', scene);
    triangleMaterial.emissiveColor = Color3.Red();
    triangleMaterial.specularColor = Color3.Black();
    triangle.material = triangleMaterial;
    triangle.isVisible = false;

    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground1]
    })
    setupCameraForCollisions(xr.input.xrCamera)

    const featureManager = xr.baseExperience.featuresManager

    // const teleportFeature = featureManager.enableFeature(WebXRFeatureName.TELEPORTATION, 'stable', {
    //     xrInput: xr.input,
    //     floorMeshes: [ground1]
    // })

    // featureManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", {
    //   xrInput: xr.input,
    // })

    // xr.baseExperience.onStateChangedObservable.add((webXRState) => {
    //     switch(webXRState) {
    //         case WebXRState.ENTERING_XR:
    //         case WebXRState.IN_XR:
    //             triangle.isVisible = true;
    //             break;
    //         default:
    //             triangle.isVisible = false;
    //             break;
    //     }
    // })
  
    // xr.baseExperience.sessionManager.onXRFrameObservable.add(() => {
    //     if (xr.baseExperience.state === WebXRState.IN_XR) {
    //         //triangle.rotation.y = (0.5 + movementFeature.movementDirection.toEulerAngles().y)
    //         triangle.position.set(xr.input.xrCamera.position.x, 0.5, xr.input.xrCamera.position.z)
    //     }
    // });
}

const onRender = (scene) => {
  
}

export default () => (
  <div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
);