"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { createVaseGeometry } from "./geometry";

/** Предметы для ощущения масштаба: керамическая ваза и стопка книг. */
export function Vase({ position }: { position: [number, number, number] }) {
  const geo = useMemo(() => createVaseGeometry(), []);
  return (
    <mesh geometry={geo} position={position}>
      <meshStandardMaterial color="#E7DED0" roughness={0.88} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Books({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[2.4, 0.32, 1.7]} />
        <meshStandardMaterial color="#56604B" roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 0.16 + 0.32 + 0.12, 0.02]} rotation-y={0.05}>
        <boxGeometry args={[2.2, 0.24, 1.55]} />
        <meshStandardMaterial color="#EDE6DA" roughness={0.92} />
      </mesh>
    </group>
  );
}
