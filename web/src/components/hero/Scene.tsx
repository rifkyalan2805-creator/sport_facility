"use client";

import * as THREE from "three";
import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import WaveRibbon from "./WaveRibbon";

/** Floating + mouse parallax pada grup objek. */
function Parallax({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    // parallax mengikuti pointer (halus, di-lerp)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.25, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.15, 0.05);
    // floating lembut
    g.position.y = Math.sin(t * 0.6) * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.4], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true, // latar transparan → halaman putih terlihat, tanpa fade gelap
        powerPreference: "high-performance",
        // ACES diterapkan via efek ToneMapping (hindari double tone-map)
        toneMapping: THREE.NoToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0xffffff, 0); // clear transparan
      }}
    >
      {/* Semua yang butuh aset (HDR) ada di dalam Suspense → preload dulu,
          baru render. Fallback null = transparan (halaman putih), bukan gelap. */}
      <Suspense fallback={null}>
        {/* HDR environment di-preload sebelum render pertama */}
        <Environment preset="city" />

        <Parallax>
          <WaveRibbon />
        </Parallax>

        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.4}
            luminanceSmoothing={0.3}
            intensity={1.45}
            radius={0.85}
          />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
