<script setup>
// Acento luminoso na "emenda" entre duas cenas. Vive dentro da cena que está entrando
// e acompanha a borda dela enquanto sobe pela tela. Cada variante tem um caráter distinto.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'

const props = defineProps({ variant: { type: String, default: 'scan' } }) // scan | bloom | none

const el = ref(null)
let ctx

onMounted(() => {
  if (props.variant === 'none' || prefersReducedMotion()) return
  const host = el.value.parentElement
  ctx = gsap.context(() => {
    const st = { trigger: host, start: 'top 100%', end: 'top 0%', scrub: 0.6 }
    if (props.variant === 'scan') {
      gsap
        .timeline({ scrollTrigger: st, defaults: { ease: 'none' } })
        .fromTo('.fx-line', { autoAlpha: 0, scaleX: 0.15 }, { autoAlpha: 1, scaleX: 1, duration: 0.4 })
        .to('.fx-line', { autoAlpha: 0, duration: 0.6 })
    } else if (props.variant === 'bloom') {
      gsap
        .timeline({ scrollTrigger: st, defaults: { ease: 'none' } })
        .fromTo('.fx-bloom', { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 0.9, scale: 1, duration: 0.45 })
        .to('.fx-bloom', { autoAlpha: 0, scale: 1.5, duration: 0.55 })
    }
  }, el.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="el" class="seam" aria-hidden="true">
    <div v-if="variant === 'scan'" class="fx-line" />
    <div v-else-if="variant === 'bloom'" class="fx-bloom" />
  </div>
</template>

<style scoped>
.seam {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  z-index: 60;
  pointer-events: none;
}
.fx-line {
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 2px;
  opacity: 0;
  background: linear-gradient(90deg, transparent 0%, #367bff 30%, #56e4f2 50%, #367bff 70%, transparent 100%);
  box-shadow: 0 0 28px 4px rgba(54, 123, 255, 0.55);
}
.fx-bloom {
  position: absolute;
  left: 50%;
  top: 0;
  width: 80vmax;
  height: 40vmax;
  margin-left: -40vmax;
  margin-top: -20vmax;
  opacity: 0;
  background: radial-gradient(ellipse at center, rgba(54, 123, 255, 0.4) 0%, rgba(86, 228, 242, 0.14) 38%, transparent 68%);
}
</style>
