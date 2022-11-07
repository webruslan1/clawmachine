<template>
  <Renderer
    ref="rendererC"
    antialias
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

      <Sphere
        :radius="0.05"
        :position="{ x: 0 }"
        :width-segments="16"
        :height-segments="16"
        receive-shadow
        cast-shadow
      >
        <PhysicalMaterial color="#ffffff" />
      </Sphere>

      <GltfModel
        :position="{ y: modelY, z: modelZ, x: modelX }"
        src="/src/assets/avtomat.glb"
        cast-shadow
      />

      <GltfModel
        :position="{ y: modelY, z: stoikaZ, x: craneX }"
        src="/src/assets/crane2.glb"
        @load="onReady"
        cast-shadow
      />

      <GltfModel
        :position="{ y: modelY, z: stoikaZ, x: modelX }"
        src="/src/assets/stoika.glb"
        cast-shadow
      />
    </Scene>
  </Renderer>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { AnimationMixer, Clock, Fog, GridHelper, Vector3 } from "three";
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
  Plane,
  GltfModel,
  FbxModel,
} from "troisjs";
const rendererC = ref();
// const meshC = ref();
const cam = ref();
onMounted(() => {
  const renderer = rendererC.value;
  // const cam = cam.value.cam;
  // renderer.onBeforeRender(() => {
  // cam.rotation.x += 0.01;
  // });
});
</script>
<script>
import loadAmmoModule from "./js/loadscript.js";
const scene = ref();
console.log(scene, "scene");
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

      mixer: null,
      allAnim: null,
    };
  },
  async mounted() {
    let someInt = setInterval(() => {
      if (this.cameraZ > 1.5) {
        this.cameraZ = this.cameraZ - 0.005;
      } else {
        clearInterval(someInt);
      }
    }, 10);
    await loadAmmoModule();

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
  },
  methods: {
    animationPlay(anim) {
      this.mixer = new AnimationMixer(this.gltf.scene);
      let action = this.mixer.clipAction(anim);
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
    async onReady(gltf) {
      this.gltf = gltf;
      this.allAnim = gltf.animations;
      console.log(scene._value.scene.children)
      //
      // new empty ammo shape
      const shape = new Ammo.btConvexHullShape();

      //new ammo triangles
      let triangle,
        triangle_mesh = new Ammo.btTriangleMesh();

      //new ammo vectors
      let vectA = new Ammo.btVector3(0, 0, 0);
      let vectB = new Ammo.btVector3(0, 0, 0);
      let vectC = new Ammo.btVector3(0, 0, 0);

      //retrieve vertices positions from object
      let verticesPos = geometry.getAttribute("position").array;
      let triangles = [];
      for (let i = 0; i < verticesPos.length; i += 3) {
        triangles.push({
          x: verticesPos[i],
          y: verticesPos[i + 1],
          z: verticesPos[i + 2],
        });
      }

      //use triangles data to draw ammo shape
      for (let i = 0; i < triangles.length - 3; i += 3) {
        vectA.setX(triangles[i].x);
        vectA.setY(triangles[i].y);
        vectA.setZ(triangles[i].z);
        shape.addPoint(vectA, true);

        vectB.setX(triangles[i + 1].x);
        vectB.setY(triangles[i + 1].y);
        vectB.setZ(triangles[i + 1].z);
        shape.addPoint(vectB, true);

        vectC.setX(triangles[i + 2].x);
        vectC.setY(triangles[i + 2].y);
        vectC.setZ(triangles[i + 2].z);
        shape.addPoint(vectC, true);

        triangle_mesh.addTriangle(vectA, vectB, vectC, true);
      }
    },
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
    // onReady(some) {
    //   console.log(some);
    //   let model = some.scene;
    //   let mixer = new AnimationMixer(model);
    //   let clip = some.animations[0];
    //   const action = mixer.clipAction(clip);
    //   this.activateAction(action);
    //   setTimeout(() => {
    //     console.log("animate start");
    //     this.animate();
    //   }, 1000);
    // },
    // activateAction(action) {
    //   // const clip = action.getClip();
    //   const settings = { weight: 1 };
    //   this.setWeight(action, settings.weight);
    //   action.play();
    // },
    // setWeight(action, weight) {
    //   action.enabled = true;
    //   action.setEffectiveTimeScale(1);
    //   action.setEffectiveWeight(weight);
    // },
    // animate() {
    //   // Render loop
    //   requestAnimationFrame(animate);
    //   for (let i = 0; i !== numAnimations; ++i) {
    //     const action = allActions[i];
    //     const clip = action.getClip();
    //     const settings = baseActions[clip.name] || additiveActions[clip.name];
    //     settings.weight = action.getEffectiveWeight();
    //   }
    //   // Get the time elapsed since the last frame, used for mixer update
    //   const mixerUpdateDelta = clock.getDelta();
    //   // Update the animation mixer, the stats panel, and render this frame
    //   mixer.update(mixerUpdateDelta);
    //   stats.update();
    //   renderer.render(scene, camera);
    // },
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