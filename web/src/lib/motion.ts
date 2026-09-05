"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Tanda tangan gerak editorial — didefinisikan SEKALI di sini dan dipakai
 * seluruh seksi homepage, agar bahasanya tidak pernah berbeda antar file.
 *
 * Prinsipnya diturunkan dari karakter statis DESIGN.md (datar, tanpa bayangan,
 * tipografi yang memimpin) karena dokumen itu tidak memuat spesifikasi gerak:
 *
 *  - Foto disingkap oleh tepi yang bergerak KIRI → KANAN (clip-path), sejalan
 *    dengan arah gradient 90deg yang dibaca sbg "laju".
 *  - Teks hanya memudar + naik 20px. Tanpa rotasi, tanpa overshoot, tanpa
 *    skala, tanpa gerak berulang tak berujung.
 *  - Tidak ada pin/scrub: halaman tetap dibaca atas ke bawah seperti broadsheet,
 *    dan panjang gulir tetap sama dengan panjang kontennya.
 */
export const MOTION = {
  ease: "power2.out",
  /** Teks: pudar + naik. */
  text: { duration: 0.7, rise: 20 },
  /** Foto: singkap bertepi. */
  media: { duration: 0.9 },
  stagger: 0.08,
  /** Mulai ketika puncak elemen mencapai 88% tinggi viewport. */
  start: "top 88%",
} as const;

/** Tempelkan pada elemen teks yang ingin di-reveal. */
export const REVEAL_TEXT = "reveal-text";
/** Tempelkan pada pembungkus foto (yang punya overflow-hidden). */
export const REVEAL_MEDIA = "reveal-media";

const HIDDEN_CLIP = "inset(0% 100% 0% 0%)";
const SHOWN_CLIP = "inset(0% 0% 0% 0%)";

/** useLayoutEffect di klien, useEffect saat SSR — hindari peringatan React. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Pasang reveal editorial pada seluruh `.reveal-text` / `.reveal-media`
 * di dalam `root`.
 *
 * Memakai ScrollTrigger.batch agar elemen yang masuk layar bersamaan tampil
 * berurutan (stagger), sementara elemen jauh di bawah menunggu gilirannya
 * sendiri — bukan satu pemicu untuk seluruh seksi.
 */
export function useEditorialReveal(root: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const texts = gsap.utils.toArray<HTMLElement>(`.${REVEAL_TEXT}`);
      const media = gsap.utils.toArray<HTMLElement>(`.${REVEAL_MEDIA}`);
      if (!texts.length && !media.length) return;

      // Hormati preferensi sistem: tampilkan konten apa adanya, tanpa gerak.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...texts, ...media], { autoAlpha: 1, y: 0, clipPath: SHOWN_CLIP });
        return;
      }

      // State awal dipasang di useLayoutEffect (sebelum paint) → tanpa kedipan.
      gsap.set(texts, { autoAlpha: 0, y: MOTION.text.rise });
      gsap.set(media, { clipPath: HIDDEN_CLIP });

      if (texts.length) {
        ScrollTrigger.batch(texts, {
          start: MOTION.start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: MOTION.text.duration,
              ease: MOTION.ease,
              stagger: MOTION.stagger,
            }),
        });
      }

      if (media.length) {
        ScrollTrigger.batch(media, {
          start: MOTION.start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              clipPath: SHOWN_CLIP,
              duration: MOTION.media.duration,
              ease: MOTION.ease,
              stagger: MOTION.stagger,
            }),
        });
      }
    }, root);

    return () => ctx.revert(); // cleanup → hapus ScrollTrigger & kembalikan style
  }, [root]);
}
