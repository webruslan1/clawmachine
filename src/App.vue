<template>
  <Renderer
    ref="rendererC"
    :orbit-ctrl="{ enableDamping: true }"
    resize="window"
  >
    <Camera ref="cam" :position="{ z: cameraZ, y: cameraY, x: cameraX }" />
    <Scene ref="scene" background="white">
      <PointLight :position="{ y: 20, z: 5, x: 0 }" />
      <PointLight :position="{ y: 0, z: 5, x: 0 }" />
      <PointLight color="red" :position="{ y: 20, z: 50, x: 100 }" />
      <Plane
        horizontal
        :width="15"
        :height="15"
        :rotation="{ x: 300 }"
        :position="{ z: 0, y: -1 }"
        receive-shadow
      >
        <PhysicalMaterial color="#aaaaaa" />
      </Plane>
      <group>
        <GltfModel
          :position="{ y: modelY, z: modelZ, x: modelX }"
          src="/src/assets/avtomat.glb"
          cast-shadow
        />

        <GltfModel
          :position="{ y: modelY, z: stoikaZ, x: craneX }"
          src="/src/assets/crane2.glb"
          cast-shadow
          @load="onReadyCrane"
        />

        <GltfModel
          :position="{ y: modelY, z: stoikaZ, x: modelX }"
          src="/src/assets/stoika.glb"
          cast-shadow
        />
      </group>

    </Scene>
  </Renderer>
</template>

<script>
import CANNON from "cannon";
import {
  AnimationMixer,
  Clock,
  Color,
  MathUtils,
  Object3D,
  InstancedMesh,
  DynamicDrawUsage,
} from "three";
import {
  Box,
  Camera,
  PhongMaterial,
  LambertMaterial,
  PointLight,
  Raycaster,
  SpotLight,
  Renderer,
  Scene,
  SphereGeometry,
  ToonMaterial,
  Plane,
  GltfModel,
  FbxModel,
} from "troisjs";
export default {
  data() {
    return {
      modelX: 0,
      modelZ: 0,
      modelY: -1,
      cameraX: 0,
      cameraY: 0,
      cameraZ: 3,
      craneX: 0,
      stoikaZ: 0,
      COUNT: 100,
      mixer: null,
      allAnim: null,
      renderer: null,
      cam: null,
      scene: null,
    };
  },
  async mounted() {
    this.renderer = this.$refs.renderer;
    this.cam = this.$refs.cam;
    this.scene = this.$refs.scene;
    document.addEventListener("keydown", async (event) => {
      switch (event.keyCode) {
        case 87:
          // w
          if (this.stoikaZ > -0.28) {
            this.stoikaZ -= 0.005;
          }
          break;
        case 65:
          if (this.craneX > -0.215) {
            this.craneX -= 0.005;
          }
          // a
          break;
        case 83:
          // s
          if (this.stoikaZ < 0.19) {
            this.stoikaZ += 0.005;
          }
          break;
        case 68:
          if (this.craneX < 0.215) {
            this.craneX += 0.005;
          }
          // d
          break;
        case 32:
          // space
          if (Math.floor(Math.random() * 2)) {
            this.takeWin();
          } else {
            this.takeLose();
          }
        default:
          break;
      }
    });

    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.82);
    var radius = 100; // m
    var sphereBody = new CANNON.Body({
      mass: 5, // kg
      position: new CANNON.Vec3(0, 0, 0), // m
      shape: new CANNON.Sphere(radius),
    });

    let groundBody = new CANNON.Body({
      mass: 0
    })

    let groundShape = new CANNON.Plane(0.1, 0.2)
    groundBody.addShape(groundShape)
    this.world.addBody(groundBody)
    this.world.addBody(sphereBody);
    console.log(this.world);
  },
  methods: {
    animationPlay(anim) {
      this.mixer = new AnimationMixer(this.gltf.scene);
      let action = this.mixer.clipAction(anim);
      this.world.step(1 / 60)
      action.play();
      this.clock = new Clock();
      this.$refs.rendererC.onBeforeRender(this.updateMixer);
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          action.paused = true;
          resolve();
        }, parseInt(anim.duration * 1000));
      });
    },
    async onReadyCrane(gltf) {
      this.gltf = gltf;
      this.allAnim = gltf.animations;
    },
    // onBeforeStep() {
    //   this.imesh.userData.bodies.forEach((body) => {
    //     if (body.position.y < -7) {
    //       body.position.set(rndFS(2), rnd(5, 7), 0);
    //       body.angularVelocity.set(0, 0, 0, 0);
    //       body.velocity.set(0, 0, 0);
    //       body.quaternion.set(0, 0, 0, 1);
    //     }
    //   });
    // },
    // initIMesh(imesh) {
    //   this.imesh = imesh;
    //   const dummy = new Object3D();
    //   const color = new Color();
    //   // const cscale = chroma.scale(niceColors[Math.floor(rnd(0, 100))]);
    //   const scales = new Array(this.COUNT);
    //   const masses = new Array(this.COUNT);
    //   const colors = new Array(this.COUNT)
    //     .fill()
    //     .map(() => niceColors[20][Math.floor(rnd(0, 5))]);
    //   for (let i = 0; i < this.COUNT; i++) {
    //     dummy.position.set(2, 5, 0);
    //     const scale = 0.5;
    //     scales[i] = scale;
    //     masses[i] = scale * 0.01;
    //     dummy.scale.set(scale, scale, scale);
    //     dummy.updateMatrix();
    //     imesh.setMatrixAt(i, dummy.matrix);
    //     imesh.setColorAt(i, color.set(colors[i]));
    //     // imesh.setColorAt(i, color.set(cscale(rnd(0, 1)).hex()));
    //   }
    //   imesh.instanceMatrix.needsUpdate = true;
    //   imesh.userData.scales = scales;
    //   imesh.userData.masses = masses;
    //   imesh.userData.damping = 0.7;
    // },
    updateMixer() {
      this.mixer.update(this.clock.getDelta());
    },
    async takeWin() {
      await this.animationPlay(this.allAnim[0]);
      this.animationPlay(this.allAnim[1]);
    },
    async takeLose() {
      await this.animationPlay(this.allAnim[0]);
      this.animationPlay(this.allAnim[3]);
    },
  },
};
</script>

<style>
body {
  margin: 0;
  background: #fff;
}
canvas {
  background: #fff;
}
</style>