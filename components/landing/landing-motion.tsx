"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function LandingMotion() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>(".landing-page");
    if (!root) return;

    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions as { isDesktop: boolean; reduceMotion: boolean };
        if (reduceMotion) return;

        gsap.fromTo(
          q("[data-hero-visual]"),
          { autoAlpha: 0, scale: 0.94, y: 36 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: "power3.out" }
        );

        gsap.fromTo(
          q(".hero-panel"),
          { autoAlpha: 0, y: 42, rotationY: isDesktop ? -8 : 0 },
          { autoAlpha: 1, y: 0, rotationY: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.12 }
        );

        gsap.utils.toArray<HTMLElement>(q("[data-scale-fade]")).forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0.28, scale: 0.9, y: 36 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                end: "bottom 18%",
                scrub: true
              }
            }
          );
        });

        gsap.utils.toArray<HTMLElement>(q("[data-reveal-word]")).forEach((word, index) => {
          gsap.fromTo(
            word,
            { autoAlpha: 0.12, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: q("[data-reveal-copy]")[0],
                start: `top+=${index * 4} 72%`,
                end: `top+=${index * 4 + 120} 48%`,
                scrub: true
              }
            }
          );
        });

        gsap.utils.toArray<HTMLElement>(q("[data-stack-card]")).forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: isDesktop ? 54 + index * 10 : 42, autoAlpha: 0.3, rotateX: isDesktop ? 5 : 0 },
            {
              y: 0,
              autoAlpha: 1,
              rotateX: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "top 52%",
                scrub: true
              }
            }
          );
        });
      }
    );

    return () => {
      mm.revert();
    };
  });

  return null;
}
