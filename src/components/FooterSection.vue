<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { REVEAL } from '../lib/reveal'
import SceneImage from './SceneImage.vue'
import SectionTransition from './SectionTransition.vue'

defineProps({ index: { type: Number, default: 8 } })

const root = ref(null)
const reduced = ref(false)
let ctx

function build() {
  const q = gsap.utils.selector(root.value)

  // Entrada: a cena emerge do escuro enquanto a anterior se apaga.
  gsap.fromTo(q('.clip'), { opacity: 0 }, {
    opacity: 1,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top 95%', end: 'top 8%', scrub: true },
  })

  // Câmera: aproximação lenta do robô e fade final para preto, guiados pelo scroll.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
  })
  tl.fromTo(q('.layer'), { transformOrigin: '49% 84%', scale: 1.02 }, { scale: 1.3, duration: 1 }, 0)
    .to(q('.content, .sign-wrap'), { autoAlpha: 0, duration: 0.06, ease: 'power1.in' }, 0.88)
    .to(q('.veil'), { opacity: 1, duration: 0.12 }, 0.9)

  // Texto: mesmo estilo e tempo da abertura. Título em duas etapas, depois complemento e assinatura.
  gsap.set(q('[data-line1], [data-line2]'), { yPercent: 115 })
  gsap.set(q('[data-copy], [data-sign]'), { ...REVEAL.fadeFrom })
  const reveal = gsap.timeline({ paused: true })
  reveal
    .to(q('[data-line1]'), { yPercent: 0, duration: REVEAL.title.duration, ease: REVEAL.title.ease }, 0.3)
    .to(q('[data-line2]'), { yPercent: 0, duration: REVEAL.title.duration, ease: REVEAL.title.ease }, 2.4)
    .to(q('[data-copy]'), { autoAlpha: 1, y: 0, ...REVEAL.fade }, 4.6)
    .to(q('[data-sign]'), { autoAlpha: 1, y: 0, ...REVEAL.fade }, 5.8)
  ScrollTrigger.create({
    trigger: root.value,
    start: 'top 30%',
    onEnter: () => reveal.play(),
    onLeaveBack: () => reveal.pause(0),
  })
}

onMounted(() => {
  reduced.value = prefersReducedMotion()
  if (reduced.value) return
  ctx = gsap.context(build, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="encerramento" ref="root" class="scene" :class="{ 'is-static': reduced }" :style="{ zIndex: index }" aria-labelledby="closing-title">
    <SectionTransition variant="bloom" />
    <div class="stage">
      <div class="clip">
        <div class="layer">
          <SceneImage
            name="encerramento"
            alt="A silhueta de um robô humanoide, vista de costas, observa a Terra que ocupa o horizonte sob um céu estrelado."
            position="50% 55%"
            position-mobile="49% 50%"
          />
        </div>
      </div>
      <div class="shade" />

      <div class="content">
        <h2 id="closing-title" class="title">
          <span class="mask"><span class="inner" data-line1>THE FUTURE IS NOT FAR OFF</span></span>
          <span class="mask"><span class="inner soft" data-line2>IT IS BEING BUILT RIGHT NOW</span></span>
        </h2>
        <p class="copy" data-copy>
2050 will be the result of the choices, discoveries, and technologies we develop today.</p>
      </div>

      <div class="sign-wrap">
        <div class="sign" data-sign>
          <strong>FUTURE 2050</strong>
          <span>A vision of tomorrow.</span>
        </div>
      </div>

      <div class="veil" />
    </div>
  </section>
</template>

<style scoped>
.scene {
  position: relative;
  height: 380svh;
  margin-top: -55svh;
}
.stage {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}
.clip,
.layer {
  position: absolute;
  inset: 0;
}
.layer {
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
    linear-gradient(180deg, rgba(5, 6, 8, 0.82) 0%, rgba(5, 6, 8, 0.5) 24%, rgba(5, 6, 8, 0.12) 42%, transparent 56%),
    linear-gradient(0deg, rgba(5, 6, 8, 0.6) 0%, transparent 24%);
}
.veil {
  z-index: 8;
  background: var(--void);
  opacity: 0;
}
/* Texto no terço superior (céu estrelado), sem cobrir o robô nem a Terra. */
.content {
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  top: clamp(3.2rem, 9svh, 6rem);
  padding: 0 1.5rem;
  text-align: center;
}
.title {
  margin: 0;
  text-shadow: 0 2px 24px rgba(5, 6, 8, 0.7);
  font-family: var(--display);
  font-weight: 600;
  font-size: clamp(1.6rem, 4.3vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.1em;
}
.inner {
  display: block;
}
.soft {
  font-weight: 300;
}
.copy {
  margin: 1.6rem auto 0;
  max-width: 30rem;
  font-size: 0.98rem;
  line-height: 1.65;
  color: rgba(244, 246, 250, 0.92);
  text-shadow: 0 1px 18px rgba(5, 6, 8, 0.95), 0 0 4px rgba(5, 6, 8, 0.6);
}
/* Assinatura no canto inferior esquerdo, longe do robô. */
.sign-wrap {
  position: absolute;
  z-index: 5;
  left: clamp(1.5rem, 6vw, 6rem);
  bottom: clamp(4rem, 10svh, 6rem);
}
.sign {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: rgba(244, 246, 250, 0.7);
  text-shadow: 0 1px 14px rgba(5, 6, 8, 0.9);
}
.sign strong {
  font-family: var(--display);
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.3em;
  color: var(--ink);
}
.scene.is-static {
  height: auto;
  min-height: 100svh;
  margin-top: 0;
}
.is-static .stage {
  position: relative;
}
@media (max-width: 767px) {
  .scene {
    height: 320svh;
  }
}
</style>
