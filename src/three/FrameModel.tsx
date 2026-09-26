"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SPECIES } from "@/config/pricing";
import { MEDIA } from "@/config/media";
import { live } from "@/lib/live";
import type { AnchorName, SceneCtl } from "./ctl";
import { DIMS, createBodyGeometry, createScreenGeometry } from "./geometry";
import { ScreenCanvas, getGrainTexture, loadPhoto } from "./textures";
import { createPoolMaterial, createShadowMaterial } from "./shaders";

const GLOW = new THREE.Color("#FFB35C");
const speciesColor = Object.fromEntries(SPECIES.map((s) => [s.id, new THREE.Color(s.color).multiplyScalar(1.12)]));

const D = DIMS;
const FRONT = D.bevel;
/** центр «следа» рамки на столе — вокруг него она поворачивается */
const ZC = FRONT - D.depthBottom / 2;

/** Якоря для выносок — в координатах корпуса. */
const ANCHORS: Record<AnchorName, THREE.Vector3> = {
  screen: new THREE.Vector3(D.screenW * 0.28, D.H * 0.66, FRONT + 0.01),
  wedge: new THREE.Vector3(D.W / 2, D.H * 0.3, FRONT - D.depthBottom * 0.55),
  base: new THREE.Vector3(0, 0.0, FRONT + 0.32),
  grain: new THREE.Vector3(-D.W / 2 + 0.07, D.H - 0.3, FRONT),
  touch: new THREE.Vector3(0, 0.07, FRONT + 0.01),
};

type Props = { ctl: SceneCtl; quality: "full" | "lite"; interactive?: boolean };

export function FrameModel({ ctl, quality, interactive }: Props) {
  const { camera, size } = useThree();
  const root = useRef<THREE.Group>(null!);
  const tilt = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const areaLight = useRef<THREE.RectAreaLight>(null!);
  const pointLight = useRef<THREE.PointLight>(null!);
  const state = useRef({ rotY: ctl.rotY, rotX: ctl.rotX, px: 0, py: 0, glow: ctl.glow, t: 0 });

  const bodyGeo = useMemo(() => createBodyGeometry(D), []);
  const screenGeo = useMemo(() => createScreenGeometry(D), []);

  const wood = useMemo(() => {
    const grain = getGrainTexture(quality === "full" ? 1024 : 512).clone();
    grain.repeat.set(0.5, 0.5);
    grain.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({
      map: grain,
      bumpMap: grain,
      bumpScale: 0.35,
      color: speciesColor[ctl.species].clone(),
      roughness: 0.55,
      clearcoat: 0.1,
      clearcoatRoughness: 0.45,
      sheen: 0.25,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color("#fff0dc"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  const screen = useMemo(() => new ScreenCanvas(), []);
  const screenMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: screen.texture,
        emissiveMap: screen.texture,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0.9,
        color: new THREE.Color("#262626"),
        roughness: 0.7,
        clearcoat: 0.35,
        clearcoatRoughness: 0.55,
      }),
    [screen],
  );

  const stripMat = useMemo(() => new THREE.MeshBasicMaterial({ color: GLOW.clone(), toneMapped: false }), []);
  const poolMat = useMemo(() => {
    const m = createPoolMaterial("#FFB35C");
    m.uniforms.uHalfW.value = D.W / 2;
    m.uniforms.uFront.value = 1.05;
    m.uniforms.uBack.value = 0.55;
    return m;
  }, []);
  const shadowMat = useMemo(() => {
    const m = createShadowMaterial();
    m.uniforms.uHalfW.value = D.W / 2 - 0.05;
    m.uniforms.uHalfD.value = D.depthBottom / 2 - 0.02;
    return m;
  }, []);
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: GLOW.clone().multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
    [],
  );

  useEffect(() => {
    let alive = true;
    loadPhoto(ctl.photo).then((p) => alive && screen.setPhoto(p));
    return () => {
      alive = false;
    };
  }, [ctl.photo, screen]);

  useEffect(
    () => () => {
      bodyGeo.dispose();
      screenGeo.dispose();
      wood.dispose();
      screenMat.dispose();
      screen.dispose();
    },
    [bodyGeo, screenGeo, wood, screenMat, screen],
  );

  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = state.current;
    s.t += dt;
    const k = 1 - Math.exp(-dt * 5);

    // поворот: сценарий секции + лёгкое следование за курсором/наклоном
    s.px += (live.px * ctl.pointer - s.px) * (1 - Math.exp(-dt * 2.5));
    s.py += (live.py * ctl.pointer - s.py) * (1 - Math.exp(-dt * 2.5));
    s.rotY += (ctl.rotY - s.rotY) * k;
    s.rotX += (ctl.rotX - s.rotX) * k;
    root.current.rotation.y = s.rotY + s.px * 0.32;
    root.current.rotation.x = s.rotX + s.py * 0.06;
    root.current.scale.setScalar(ctl.scale);

    // порода: цвет плавно перетекает
    wood.color.lerp(speciesColor[ctl.species], 1 - Math.exp(-dt * 3));

    // свет под рамкой
    const breath = ctl.breath * (0.5 + 0.5 * Math.sin(s.t * 1.1)) * 0.18;
    const target = Math.min(1.4, ctl.glow + breath + ctl.voice * live.voice * 0.95 + ctl.flash);
    s.glow += (target - s.glow) * (1 - Math.exp(-dt * 9));
    const g = s.glow;
    stripMat.color.copy(GLOW).multiplyScalar(0.2 + g * 3.6);
    poolMat.uniforms.uIntensity.value = g * 1.05;
    areaLight.current.intensity = g * 7;
    pointLight.current.intensity = g * 1.6;

    // экран
    screenMat.emissiveIntensity = 0.9 * ctl.screen;
    screenMat.color.setScalar(0.15 * ctl.screen + 0.02);
    screen.update(ctl.caption, dt);

    // пульс «коснитесь, чтобы ответить»
    const pr = (s.t * 0.7) % 1;
    ringMat.opacity = ctl.pulse * (1 - pr) * 0.9;
    ring.current.scale.setScalar(0.6 + pr * 1.1);
    ring.current.visible = ctl.pulse > 0.01;

    // экранные координаты якорей для выносок
    if (ctl.anchors.length) {
      body.current.updateWorldMatrix(true, false);
      for (const name of ctl.anchors) {
        v.copy(ANCHORS[name]).applyMatrix4(body.current.matrixWorld).project(camera);
        const p = ctl.projected[name] ?? (ctl.projected[name] = { x: 0, y: 0 });
        p.x = ((v.x + 1) / 2) * size.width;
        p.y = ((1 - v.y) / 2) * size.height;
      }
    }
  });

  const onTap = interactive
    ? (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        ctl.onScreenTap?.();
      }
    : undefined;

  return (
    <group ref={root}>
      {/* след на столе: тень и тёплое пятно света */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} material={shadowMat} renderOrder={1}>
        <planeGeometry args={[D.W + 2.4, D.depthBottom + 2.4]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, D.depthBottom / 2 - 0.05]} material={poolMat} renderOrder={2}>
        <planeGeometry args={[D.W * 3.6, 4.4]} />
      </mesh>
      <rectAreaLight ref={areaLight} args={[GLOW, 0, D.W * 0.85, D.depthBottom]} position={[0, 0.05, 0]} rotation-x={-Math.PI / 2} />
      <pointLight ref={pointLight} color={GLOW} intensity={0} distance={2.2} decay={2} position={[0, 0.09, D.depthBottom / 2 + 0.22]} />

      {/* наклон назад вокруг заднего нижнего ребра */}
      <group position={[0, 0, -D.depthBottom / 2]}>
        <group ref={tilt} rotation-x={-D.tilt}>
          <group position={[0, 0, D.depthBottom / 2 - ZC]}>
            <group ref={body}>
              {MEDIA.frameModel ? (
                <Suspense fallback={null}>
                  <GltfFrame url={MEDIA.frameModel} wood={wood} screen={screenMat} onTap={onTap} />
                </Suspense>
              ) : (
                <>
                  <mesh geometry={bodyGeo} material={wood} />
                  <mesh geometry={screenGeo} material={screenMat} position={[0, 0, FRONT + 0.0015]} onClick={onTap} />
                </>
              )}
              <mesh ref={ring} position={[0, D.H / 2, FRONT + 0.005]} material={ringMat} visible={false}>
                <ringGeometry args={[0.2, 0.215, 64]} />
              </mesh>
            </group>
            {/* светящаяся кромка под основанием */}
            <mesh position={[0, 0.006, FRONT - D.depthBottom * 0.5]} material={stripMat}>
              <boxGeometry args={[D.W * 0.82, 0.012, D.depthBottom * 0.78]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Готовая 3D-модель вместо процедурной (MEDIA.frameModel = "/models/frame.glb").
 * Ожидается та же система координат: низ в y = 0, лицо смотрит в +z, 1 единица = 10 см.
 * Меши, в имени которых есть «screen», получают материал экрана, остальные — дерево.
 */
function GltfFrame({ url, wood, screen, onTap }: { url: string; wood: THREE.Material; screen: THREE.Material; onTap?: (e: { stopPropagation: () => void }) => void }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.material = /screen|экран/i.test(m.name) ? screen : wood;
    });
    return c;
  }, [scene, wood, screen]);
  return <primitive object={model} onClick={onTap} />;
}
