"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./ribbonShaders";

/**
 * Pita gelombang abstrak — geometri plane bersubdivisi tinggi yang
 * dideformasi noise prosedural di vertex shader, tampilan glass/neon.
 */
export default function WaveRibbon() {
  const material = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0.55 },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (material.current) {
      // jepit delta agar animasi stabil walau frame drop
      material.current.uniforms.uTime.value += Math.min(delta, 1 / 30);
    }
  });

  return (
    <mesh rotation={[-0.32, 0, 0.14]}>
      <planeGeometry args={[5, 1.7, 260, 90]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
