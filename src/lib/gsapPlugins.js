"use client";

// Registers the ScrollTrigger plugin once, in one place. Every section
// component that uses scroll-triggered animation imports gsap (and
// ScrollTrigger, if it needs the binding directly — most just need the
// plugin registered) from here instead of registering it again itself.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };