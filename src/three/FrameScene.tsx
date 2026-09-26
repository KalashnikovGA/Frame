"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import type { SceneCtl } from "./ctl";
import { FrameModel } from "./FrameModel";
import { Books, Vase } from "./Props";
import { createHaloMaterial } from "./shaders";
import { getGrainTexture } from "./textures";

let rectLibReady = false;

export type SceneProps = {
  ctl: SceneCtl;
  quality: "full" | "lite";
  active: boolean;
  interactive?: boolean;
  onReady?: () => void;
};

const STAGE = new THREE.Color("#14100D");
const NIGHT = new THREE.Color("#07070A");

/** Камера: сценарий секции + композиция (сдвиг кадра) + мягкое парение. */
function Rig({ ctl }: { ctl: SceneCtl }) {
  const { camera, size, scene } = useThree();
  const pos = useMemo(() => new THREE.Vector3(ctl.camX, ctl.camY, ctl.camZ), [ctl]);
  const tgt = useMemo(() => new THREE.Vector3(ctl.tgtX, ctl.tgtY, ctl.tgtZ), [ctl]);
  const want = useMemo(() => new THREE.Vector3(), []);
  const wantT = useMemo(() => new THREE.Vector3(), []);
  const t = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    t.current += dt;
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const pull = Math.max(1, ctl.minAspect / aspect);
    wantT.set(ctl.tgtX, ctl.tgtY, ctl.tgtZ);
    want.set(ctl.camX, ctl.camY, ctl.camZ).sub(wantT).multiplyScalar(pull).add(wantT);
    want.x += Math.sin(t.current * 0.23) * 0.06 * ctl.drift;
    want.y += Math.sin(t.current * 0.31 + 1) * 0.035 * ctl.drift;
    const k = 1 - Math.exp(-dt * 6);
    pos.lerp(want, k);
    tgt.lerp(wantT, k);
    cam.position.copy(pos);
    cam.lookAt(tgt);
    // туман начинается за рамкой, как бы далеко ни стояла камера
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      const dist = pos.distanceTo(tgt);
      fog.near = dist + 1.5;
      fog.far = dist + 11;
    }
    if (Math.abs(cam.fov - ctl.fov) > 0.01) cam.fov += (ctl.fov - cam.fov) * k;
    cam.setViewOffset(size.width, size.height, -ctl.shiftX * size.width, -ctl.shiftY * size.height, size.width, size.height);
    cam.updateProjectionMatrix();
  });
  return null;
}

/** Свет: тёплый вечер → ночь. */
function Lights({ ctl }: { ctl: SceneCtl }) {
  const { scene } = useThree();
  const amb = useRef<THREE.AmbientLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const moon = useRef<THREE.DirectionalLight>(null!);
  const bg = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const n = ctl.night;
    amb.current.intensity = 0.22 * (1 - n * 0.75);
    sun.current.intensity = 2.1 * (1 - n);
    rim.current.intensity = 1.0 * (1 - n * 0.85);
    moon.current.intensity = 0.7 * n;
    scene.environmentIntensity = 0.55 * (1 - n * 0.8);
    bg.copy(STAGE).lerp(NIGHT, n);
    (scene.background as THREE.Color | null)?.copy(bg);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(bg);
  });

  return (
    <>
      <ambientLight ref={amb} color="#ffe2c4" />
      <directionalLight ref={sun} color="#ffe2c0" position={[-4.5, 5, 3.2]} />
      <directionalLight ref={rim} color="#ffc48e" position={[4, 3.2, -3.5]} />
      <directionalLight ref={moon} color="#8a9ccc" position={[2.5, 4, 4]} intensity={0} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff0dc" position={[-5, 3, 3]} scale={[5, 3, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#ffe8d0" position={[4, 4, 4]} scale={[4, 2, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#ffd2a0" position={[0, 6, -3]} scale={[8, 2, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

function Backdrop({ ctl }: { ctl: SceneCtl }) {
  const mat = useMemo(() => createHaloMaterial(), []);
  useFrame(() => {
    mat.uniforms.uAmount.value = 1 - ctl.night * 0.85;
  });
  return (
    <mesh position={[0, 1.6, -3]} material={mat} renderOrder={-1}>
      <planeGeometry args={[18, 9]} />
    </mesh>
  );
}

function Table({ quality }: { quality: "full" | "lite" }) {
  const map = useMemo(() => {
    const t = getGrainTexture(quality === "full" ? 1024 : 512).clone();
    t.repeat.set(3, 3);
    t.needsUpdate = true;
    return t;
  }, [quality]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      {quality === "full" ? (
        <MeshReflectorMaterial
          map={map}
          color="#4a3326"
          roughness={0.62}
          metalness={0.05}
          blur={[420, 120]}
          resolution={1024}
          mixBlur={1.1}
          mixStrength={1.6}
          mixContrast={1}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
          mirror={0.5}
        />
      ) : (
        <meshStandardMaterial map={map} color="#4a3326" roughness={0.5} metalness={0.05} />
      )}
    </mesh>
  );
}

function Ready({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  const frames = useRef(0);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 2) {
      done.current = true;
      onReady?.();
    }
  });
  return null;
}

export default function FrameScene({ ctl, quality, active, interactive, onReady }: SceneProps) {
  useEffect(() => {
    if (!rectLibReady) {
      RectAreaLightUniformsLib.init();
      rectLibReady = true;
    }
  }, []);
  if (typeof window !== "undefined" && !rectLibReady) {
    RectAreaLightUniformsLib.init();
    rectLibReady = true;
  }

  const full = quality === "full";

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={full ? [1, 1.75] : [1, 1.5]}
      gl={{ antialias: !full, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: ctl.fov, near: 0.1, far: 80, position: [ctl.camX, ctl.camY, ctl.camZ] }}
      events={interactive ? undefined : () => ({ enabled: false, priority: 0 })}
      style={{ touchAction: "pan-y" }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = full ? THREE.NoToneMapping : THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
        scene.background = STAGE.clone();
        scene.fog = new THREE.Fog(STAGE.clone(), 7, 17);
      }}
    >
      <Rig ctl={ctl} />
      <Lights ctl={ctl} />
      <Backdrop ctl={ctl} />
      <Table quality={quality} />
      <FrameModel ctl={ctl} quality={quality} interactive={interactive} />
      {ctl.companions.map((c, i) => (
        <FrameModel key={i} ctl={c.ctl} quality={quality} position={c.position} baseRotY={c.rotY} />
      ))}
      {ctl.props.vase && <Vase position={[-2.75, 0, -0.35]} />}
      {ctl.props.books && <Books position={[2.9, 0, -0.1]} rotation={-0.18} />}
      {full && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.25} intensity={0.9} radius={0.72} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      )}
      <Ready onReady={onReady} />
    </Canvas>
  );
}
