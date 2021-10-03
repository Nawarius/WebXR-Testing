import React from "react"
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, 
  Mesh, Color3, StandardMaterial, WebXRState, WebXRFeatureName, WebXRControllerComponent, 
  Texture, ActionManager, SetValueAction, InterpolateValueAction, ExecuteCodeAction } from "@babylonjs/core"
import * as GUI from '@babylonjs/gui'

import "@babylonjs/loaders/glTF"
import SceneComponent from "./SceneComponent"
import Rick from '../assets/rick.jpg'
import Coco from '../assets/coco.jpg'
import Robo from '../assets/robo.jpg'
import Blade from '../assets/blade.jpg'
import CloseButton from '../assets/closeButton.svg'

const pictures = [
  {imagePath: Rick, title: 'Rick and Morty Title', shortDesc: 'Rick and Morty Short'}, 
  {imagePath: Coco, title: 'Coco Secret Title', shortDesc: 'Coco Secret Title'}, 
  {imagePath: Robo, title: 'Robo Recall Title', shortDesc: 'Robo Recall Short'}, 
  {imagePath: Blade, title: 'Blade and Sorcery Title', shortDesc: 'Blade and Sorcery Short'}
]

function setupCameraForCollisions(camera) {
    camera.checkCollisions = true
    camera.applyGravity = true
    camera.ellipsoid = new Vector3(1, 1, 1)
}

const onSceneReady = async (scene) => {

    scene.gravity = new Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true

    var camera = new FreeCamera("camera1", new Vector3(0, 2.5, -6), scene);
    camera.speed = 0.5
    const canvas = scene.getEngine().getRenderingCanvas();

    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    setupCameraForCollisions(camera);

    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
    light.intensity = 0.7;

    const ground1 = MeshBuilder.CreateGround('ground1', {width: 200, height: 200}, scene)
    ground1.position.y = 0;  
    ground1.checkCollisions = true;


    const triangle = MeshBuilder.CreateCylinder("triangle", {
        tessellation: 3, height: 0.1, subdivisions: 4, diameterTop: 1, diameterBottom: 1
    }, scene)

    const triangleMaterial = new StandardMaterial('triangle-mat', scene);
    triangleMaterial.emissiveColor = Color3.Red();
    triangleMaterial.specularColor = Color3.Black();
    triangle.material = triangleMaterial;
    triangle.isVisible = false;


     
    // GUI
    const guiPlane =  MeshBuilder.CreatePlane(`gui plane`, {size: 10, sideOrientation: Mesh.DOUBLESIDE})
    guiPlane.position = new Vector3(-2, 5, 0)
    guiPlane.rotation.y = -0.5

    guiPlane.checkCollisions = true
    guiPlane.ellipsoid = new Vector3(1, 1, 1)

    //const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(guiPlane)
    var rc = new GUI.Rectangle()
    rc.thickness = 10;
    rc.width = 0.8;
    rc.height = 0.8;
    rc.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    rc.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    rc.background = "white";
    rc.isVisible = false

    advancedTexture.addControl(rc)

    var image = new GUI.Image("but", Rick)
    image.width = 0.4
    image.height = 0.4
    image.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    image.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
    image.top = 50

    let title = new GUI.TextBlock('title', 'Default Text')
    title.fontSize = 32
    title.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    title.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

    let shortDesc = new GUI.TextBlock('title', 'Default Short')
    shortDesc.fontSize = 24
    shortDesc.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    shortDesc.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER

    let closeButton = GUI.Button.CreateImageOnlyButton("closeButton", CloseButton)
    closeButton.width = '40px'
    closeButton.height = '40px'
    closeButton.hoverCursor = 'pointer'
    closeButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
    closeButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_RIGHT
    closeButton.onPointerUpObservable.add(() => rc.isVisible = false)
    closeButton.onPointerMoveObservable.add(() => closeButton.color = 'red')
    closeButton.onPointerOutObservable.add(() => closeButton.color = 'none')
    
    rc.addControl(image)
    rc.addControl(title)
    rc.addControl(shortDesc)
    rc.addControl(closeButton)

    scene.actionManager = new ActionManager(scene)
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
          { trigger: ActionManager.OnKeyDownTrigger },
          (evt) => { if(evt.sourceEvent.key === 'Escape') rc.isVisible = false }
      )
    )

    // Over/Out
    const makeOverOut = (mesh, pictureObj) => {
      mesh.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor))
      mesh.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", Color3.White()))
      mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, mesh, "scaling", new Vector3(1, 1, 1), 150))
      mesh.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, mesh, "scaling", new Vector3(1.1, 1.1, 1.1), 150))

      mesh.actionManager.registerAction(new ExecuteCodeAction(
            { trigger: ActionManager.OnPickTrigger },
            () => {
              rc.isVisible = true
              image.source = pictureObj.imagePath
              title.text = pictureObj.title
              shortDesc.text = pictureObj.shortDesc
            }
        )
      )
        
    } 

    pictures.forEach((pictureObj, index) => {
      const material = new StandardMaterial(`image material ${index}`, scene)
      material.diffuseTexture = new Texture(pictureObj.imagePath, scene)

      const imagePlane = MeshBuilder.CreatePlane(`image ${index}`, {size: 2, sideOrientation: Mesh.DOUBLESIDE})
      
      imagePlane.actionManager = new ActionManager(scene)

      imagePlane.position = new Vector3(index * 2, 2, -index)
      imagePlane.material = material

      makeOverOut(imagePlane, pictureObj)
    })

    const xr = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground1],
      disableTeleportation: true
    })
    xr.input.xrCamera.speed = 0.5
    setupCameraForCollisions(xr.input.xrCamera)

    const featureManager = xr.baseExperience.featuresManager

    const swappedHandednessConfiguration = [
      {
        allowedComponentTypes: [WebXRControllerComponent.THUMBSTICK_TYPE, WebXRControllerComponent.TOUCHPAD_TYPE],
        forceHandedness: "right",
        axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
          movementState.rotateX = Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0
          movementState.rotateY = Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0
        },
      },
      {
        allowedComponentTypes: [WebXRControllerComponent.THUMBSTICK_TYPE, WebXRControllerComponent.TOUCHPAD_TYPE],
        forceHandedness: "left",
        axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
          movementState.moveX = Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0
          movementState.moveY = Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0
        },
      },
    ];
    
    const movementFeature = featureManager.enableFeature(WebXRFeatureName.MOVEMENT, "latest", {
      xrInput: xr.input,
      //movementOrientationFollowsViewerPose: true,
      customRegistrationConfigurations: swappedHandednessConfiguration
    })

    xr.baseExperience.onStateChangedObservable.add((webXRState) => {
        switch(webXRState) {
            case WebXRState.ENTERING_XR:
            case WebXRState.IN_XR:
                triangle.isVisible = true;
                break;
            default:
                triangle.isVisible = false;
                break;
        }
    })
    
    xr.baseExperience.sessionManager.onXRFrameObservable.add(() => {
        if (xr.baseExperience.state === WebXRState.IN_XR) {
            triangle.rotation.y = (0.5 + movementFeature.movementDirection.toEulerAngles().y)
            triangle.position.set(xr.input.xrCamera.position.x, 0.5, xr.input.xrCamera.position.z)
        }
    })

}

const onRender = (scene) => {
  
}

export default () => (
  <div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
);