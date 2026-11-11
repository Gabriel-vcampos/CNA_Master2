<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { REVEAL } from '../lib/reveal'
import SceneImage from './SceneImage.vue'

const props = defineProps({ ready: { type: Boolean, default: false } })

const root = ref(null)
const reduced = prefersReducedMotion()
let ctx
let intro

function build() {
  const q = gsap.utils.selector(root.value)
  if (reduced) return

  // Estado inicial (antes do preloader abrir)
  gsap.set(q('.clip'), { opacity: 0 })
  gsap.set(q('[data-title]'), { yPercent: 115 })
  gsap.set(q('[data-fade]'), { ...REVEAL.fadeFrom })
  gsap.set(q('.cue'), { autoAlpha: 0 })

  // Abertura temporal: a Terra emerge, as letras sobem e a câmera começa a se aproximar.
  intro = gsap.timeline({ paused: true })
  intro
    .to(q('.clip'), { opacity: 1, duration: 3.4, ease: 'power2.out' }, 0)
    .fromTo(q('.clip'), { scale: 1 }, { scale: 1.07, duration: 14, ease: 'power1.out' }, 0)
    .to(q('[data-title]'), { yPercent: 0, ...REVEAL.title }, 1.3)
    .to(q('[data-fade]'), { autoAlpha: 1, y: 0, ...REVEAL.fade, stagger: REVEAL.fadeStagger }, 3.2)
    .to(q('.cue'), { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 5)

  // Rolagem: a câmera avança em direção ao planeta e a cena escurece para a próxima.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
  })
  tl.fromTo(q('.layer'), { transformOrigin: '50% 62%', scale: 1 }, { scale: 1.45, duration: 1 }, 0)
    .to(q('.cue'), { autoAlpha: 0, duration: 0.08 }, 0)
    .to(q('.content'), { autoAlpha: 0, y: -50, duration: 0.26, ease: 'power1.in' }, 0.3)
    .to(q('.veil'), { opacity: 1, duration: 0.2 }, 0.8)
}

watch(
  () => props.ready,
  (v) => v && intro?.play(),
)

onMounted(() => {
  ctx = gsap.context(build, root.value)
  if (props.ready) intro?.play()
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="hero" ref="root" class="hero" aria-labelledby="hero-title">
    <div class="stage">
      <div class="clip">
        <div class="layer">
          <SceneImage
            name="terra"
            alt="A Terra vista do espaço: atmosfera azul iluminada, nuvens, luzes de cidades à noite e o espaço profundo ao fundo."
            position="50% 50%"
            eager
          />
        </div>
      </div>
      <div class="shade" />
      <div class="veil" />

      <div class="content">
        <h1 id="hero-title" class="title">
          <span class="mask"><span class="light" data-title>FUTURE</span></span>
          <span class="mask"><span class="bold" data-title>2050</span></span>
        </h1>
        <p class="question" data-fade>What Will the World Look Like 24 Years from Now?</p>
        <p class="note" data-fade>A new era is aproaching.</p>
      </div>

      <div class="cue" aria-hidden="true">
        <span>Roll to explore</span>
        <i />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 250svh;
  z-index: 0;
}
.stage {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}
.clip {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}
.layer {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.shade,
.veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.shade {
  background:
    radial-gradient(ellipse 70% 55% at 50% 48%, rgba(5, 6, 8, 0.55) 0%, rgba(5, 6, 8, 0.18) 60%, transparent 100%),
    linear-gradient(0deg, rgba(5, 6, 8, 0.7) 0%, transparent 34%),
    linear-gradient(180deg, rgba(5, 6, 8, 0.45) 0%, transparent 28%);
}
.veil {
  background: var(--void);
  opacity: 0;
}
.content {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  text-align: center;
}
.title {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(3rem, 12.5vw, 11.5rem);
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 30px rgba(5, 6, 8, 0.55);
}
.mask {
  display: block;
  overflow: hidden;
  padding: 0.04em 0.1em 0.1em;
}
.light {
  display: block;
  font-weight: 300;
  letter-spacing: 0.02em;
}
.bold {
  display: block;
  font-weight: 600;
}
.question {
  margin: 2.2rem 0 0;
  font-family: var(--display);
  font-size: clamp(1.05rem, 2vw, 1.6rem);
  font-weight: 400;
  text-shadow: 0 1px 18px rgba(5, 6, 8, 0.8);
}
.note {
  margin: 0.7rem 0 0;
  font-size: 0.95rem;
  color: rgba(244, 246, 250, 0.75);
  text-shadow: 0 1px 14px rgba(5, 6, 8, 0.8);
}
.cue {
  position: absolute;
  left: 50%;
  bottom: clamp(1.6rem, 5svh, 3rem);
  z-index: 5;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.74rem;
  color: var(--mute);
}
.cue i {
  display: block;
  width: 1px;
  height: 2.6rem;
  background: linear-gradient(180deg, var(--cyan), transparent);
  transform-origin: top;
  animation: cue 2.2s cubic-bezier(0.6, 0, 0.3, 1) infinite;
}
@keyframes cue {
  0% {
    transform: scaleY(0);
    opacity: 1;
  }
  60% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero {
    height: auto;
    min-height: 100svh;
  }
  .stage {
    position: relative;
  }
  .cue i {
    animation: none;
  }
}
</style>
