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
/** к этому оттенку свет уходит при записи ответа — теплее и глубже */
const GLOW_WARM = new THREE.Color("#FF7A2E");
const speciesColor = Object.fromEntries(SPECIES.map((s) => [s.id, new THREE.Color(s.color).multiplyScalar(1.12)]));

const D = DIMS;
const FRONT = D.bevel;
/** центр «следа» рамки на столе — вокруг него она поворачивается */
const ZC = FRONT - D.depthBottom / 2;
/** насколько расходятся слои в разобранном виде */
const EX = { glass: 1.45, panel: 0.78, board: 1.15, led: 0.32 };
const BACK = FRONT - D.depthBottom * 0.5;

/** Якоря выносок в координатах корпуса; e — степень разборки. */
function anchor(name: AnchorName, e: number, v: THREE.Vector3) {
  switch (name) {
    case "screen": return v.set(D.screenW * 0.28, D.H * 0.66, FRONT + 0.01);
    case "wedge": return v.set(D.W / 2, D.H * 0.3, FRONT - D.depthBottom * 0.55);
    case "base": return v.set(0, 0, FRONT + 0.32);
    case "grain": return v.set(-D.W / 2 + 0.07, D.H - 0.3, FRONT);
    case "touch": return v.set(0, 0.07, FRONT + 0.01);
    case "glass": return v.set(D.screenW * 0.42, D.H * 0.86, FRONT + 0.004 + e * EX.glass);
    case "panel": return v.set(-D.screenW * 0.38, D.H * 0.3, FRONT + 0.002 + e * EX.panel);
    case "board": return v.set(-D.W * 0.18, D.H * 0.6, BACK - e * EX.board);
    case "speaker": return v.set(D.W * 0.22, D.H * 0.42, BACK - e * EX.board - 0.04);
    case "led": return v.set(D.W * 0.3, 0.02 - e * EX.led, FRONT - D.depthBottom * 0.5);
  }
}

type Props = { ctl: SceneCtl; quality: "full" | "lite"; interactive?: boolean; position?: [number, number, number]; baseRotY?: number };

export function FrameModel({ ctl, quality, interactive, position = [0, 0, 0], baseRotY = 0 }: Props) {
  const { camera, size } = useThree();
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const recRing = useRef<THREE.Mesh>(null!);
  const panel = useRef<THREE.Group>(null!);
  const glass = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Group>(null!);
  const led = useRef<THREE.Mesh>(null!);
  const areaLight = useRef<THREE.RectAreaLight>(null!);
  const pointLight = useRef<THREE.PointLight>(null!);
  const state = useRef({ rotY: ctl.rotY, rotX: ctl.rotX, px: 0, py: 0, glow: ctl.glow, t: 0, ripple: 1, rippleSeen: ctl.ripple, rippleAuto: 0, rec: 0 });

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
  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, depthWrite: false }),
    [],
  );
  const parts = useMemo(
    () => ({
      board: new THREE.MeshStandardMaterial({ color: "#1d3b2c", roughness: 0.6, metalness: 0.1 }),
      chip: new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.4, metalness: 0.3 }),
      metal: new THREE.MeshStandardMaterial({ color: "#b8a88c", roughness: 0.3, metalness: 0.9 }),
      speaker: new THREE.MeshStandardMaterial({ color: "#242424", roughness: 0.8 }),
      back: new THREE.MeshStandardMaterial({ color: "#0e0e0e", roughness: 0.9 }),
    }),
    [],
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
  const recMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: GLOW_WARM.clone().multiplyScalar(1.8), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const recGeos = useMemo(() => Array.from({ length: 49 }, (_, i) => new THREE.RingGeometry(0.26, 0.285, 64, 1, Math.PI / 2, -(i / 48) * Math.PI * 2)), []);

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
      recGeos.forEach((g) => g.dispose());
    },
    [bodyGeo, screenGeo, wood, screenMat, screen, recGeos],
  );

  const v = useMemo(() => new THREE.Vector3(), []);
  const glowColor = useMemo(() => new THREE.Color(), []);

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
    root.current.rotation.y = baseRotY + s.rotY + s.px * 0.32;
    root.current.rotation.x = s.rotX + s.py * 0.06;
    root.current.scale.setScalar(ctl.scale);

    wood.color.lerp(speciesColor[ctl.species], 1 - Math.exp(-dt * 3));

    // свет под рамкой: уровень, дыхание, голос, вспышка; оттенок — от янтарного к тёплому
    const breath = ctl.breath * (0.5 + 0.5 * Math.sin(s.t * 1.1)) * 0.18;
    const target = Math.min(1.6, ctl.glow + breath + ctl.voice * live.voice * 0.95 + ctl.flash);
    s.glow += (target - s.glow) * (1 - Math.exp(-dt * 9));
    const g = s.glow;
    glowColor.copy(GLOW).lerp(GLOW_WARM, THREE.MathUtils.clamp(ctl.warmth, 0, 1));
    stripMat.color.copy(glowColor).multiplyScalar(0.2 + g * 3.6);
    (poolMat.uniforms.uColor.value as THREE.Color).copy(glowColor);
    poolMat.uniforms.uIntensity.value = g * 1.05;
    areaLight.current.color.copy(glowColor);
    areaLight.current.intensity = g * 7;
    pointLight.current.color.copy(glowColor);
    pointLight.current.intensity = g * 1.6;

    // волна по столу: по сигналу секции или сама раз в rippleEvery секунд
    if (ctl.ripple !== s.rippleSeen) {
      s.rippleSeen = ctl.ripple;
      s.ripple = 0;
    }
    if (ctl.rippleEvery > 0) {
      s.rippleAuto += dt;
      if (s.rippleAuto > ctl.rippleEvery) {
        s.rippleAuto = 0;
        s.ripple = 0;
      }
    }
    s.ripple = Math.min(1, s.ripple + dt / 1.8);
    poolMat.uniforms.uRipple.value = s.ripple;
    poolMat.uniforms.uRippleAmp.value = 0.35 + g * 0.6;

    // экран
    screenMat.emissiveIntensity = 0.9 * ctl.screen;
    screenMat.color.setScalar(0.15 * ctl.screen + 0.02);
    screen.update(ctl.caption, dt);

    // пульс «коснитесь, чтобы ответить»
    const pr = (s.t * 0.7) % 1;
    ringMat.opacity = ctl.pulse * (1 - pr) * 0.9;
    ring.current.scale.setScalar(0.6 + pr * 1.1);
    ring.current.visible = ctl.pulse > 0.01;

    // кольцо записи ответа
    s.rec += (ctl.record - s.rec) * (1 - Math.exp(-dt * 10));
    const ri = Math.round(THREE.MathUtils.clamp(s.rec, 0, 1) * 48);
    recRing.current.geometry = recGeos[ri];
    recMat.opacity = ctl.record > 0.001 ? 0.95 : Math.max(0, recMat.opacity - dt * 2);
    recRing.current.visible = recMat.opacity > 0.01;

    // разобранный вид
    const e = THREE.MathUtils.clamp(ctl.explode, 0, 1);
    panel.current.position.z = FRONT + 0.0015 + e * EX.panel;
    glass.current.position.z = FRONT + 0.004 + e * EX.glass;
    glassMat.opacity = Math.min(1, e * 3) * 0.22;
    glass.current.visible = e > 0.001;
    inner.current.visible = e > 0.001;
    inner.current.position.z = BACK - e * EX.board;
    led.current.position.y = 0.006 - e * EX.led;

    // экранные координаты якорей для выносок
    if (ctl.anchors.length) {
      body.current.updateWorldMatrix(true, false);
      for (const name of ctl.anchors) {
        anchor(name, e, v).applyMatrix4(body.current.matrixWorld).project(camera);
        const p = ctl.projected[name] ?? (ctl.projected[name] = { x: 0, y: 0 });
        p.x = ((v.x + 1) / 2) * size.width;
        p.y = ((1 - v.y) / 2) * size.height;
      }
    }
  });

  const onTap = interactive
    ? (ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        ctl.onScreenTap?.();
      }
    : undefined;

  return (
    <group ref={root} position={position}>
      {/* след на столе: тень и тёплое пятно света */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} material={shadowMat} renderOrder={1}>
        <planeGeometry args={[D.W + 2.4, D.depthBottom + 2.4]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, D.depthBottom / 2 - 0.05]} material={poolMat} renderOrder={2}>
        <planeGeometry args={[D.W * 3.6, 5.6]} />
      </mesh>
      <rectAreaLight ref={areaLight} args={[GLOW, 0, D.W * 0.85, D.depthBottom]} position={[0, 0.05, 0]} rotation-x={-Math.PI / 2} />
      <pointLight ref={pointLight} color={GLOW} intensity={0} distance={2.2} decay={2} position={[0, 0.09, D.depthBottom / 2 + 0.22]} />

      {/* наклон назад вокруг заднего нижнего ребра */}
      <group position={[0, 0, -D.depthBottom / 2]}>
        <group rotation-x={-D.tilt}>
          <group position={[0, 0, D.depthBottom / 2 - ZC]}>
            <group ref={body}>
              {MEDIA.frameModel ? (
                <Suspense fallback={null}>
                  <GltfFrame url={MEDIA.frameModel} wood={wood} screen={screenMat} onTap={onTap} />
                </Suspense>
              ) : (
                <>
                  <mesh geometry={bodyGeo} material={wood} />
                  <group ref={panel} position={[0, 0, FRONT + 0.0015]}>
                    <mesh geometry={screenGeo} material={screenMat} onClick={onTap} />
                    <mesh position={[0, D.H / 2, -0.012]} material={parts.back}>
                      <boxGeometry args={[D.screenW * 0.99, D.screenH * 0.99, 0.02]} />
                    </mesh>
                  </group>
                  <mesh ref={glass} geometry={screenGeo} material={glassMat} position={[0, 0, FRONT + 0.004]} visible={false} />
                </>
              )}
              {/* электроника: видна только в разобранном виде */}
              <group ref={inner} position={[0, 0, BACK]} visible={false}>
                <mesh position={[-D.W * 0.08, D.H * 0.52, 0]} material={parts.board}>
                  <boxGeometry args={[D.W * 0.62, D.H * 0.5, 0.025]} />
                </mesh>
                <mesh position={[-D.W * 0.2, D.H * 0.58, -0.025]} material={parts.chip}>
                  <boxGeometry args={[0.28, 0.28, 0.03]} />
                </mesh>
                <mesh position={[0.05, D.H * 0.66, -0.022]} material={parts.metal}>
                  <boxGeometry args={[0.34, 0.16, 0.025]} />
                </mesh>
                <mesh position={[-D.W * 0.02, D.H * 0.4, -0.02]} material={parts.chip}>
                  <boxGeometry args={[0.16, 0.12, 0.02]} />
                </mesh>
                <mesh position={[D.W * 0.22, D.H * 0.42, -0.04]} rotation-x={Math.PI / 2} material={parts.speaker}>
                  <cylinderGeometry args={[0.2, 0.2, 0.07, 48]} />
                </mesh>
                <mesh position={[D.W * 0.22, D.H * 0.42, -0.078]} rotation-x={Math.PI / 2} material={parts.metal}>
                  <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
                </mesh>
              </group>
              <mesh ref={ring} position={[0, D.H / 2, FRONT + 0.005]} material={ringMat} visible={false}>
                <ringGeometry args={[0.2, 0.215, 64]} />
              </mesh>
              <mesh ref={recRing} position={[0, D.H / 2, FRONT + 0.006]} material={recMat} geometry={recGeos[0]} visible={false} />
            </group>
            {/* светодиодная полоса под основанием */}
            <mesh ref={led} position={[0, 0.006, FRONT - D.depthBottom * 0.5]} material={stripMat}>
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
