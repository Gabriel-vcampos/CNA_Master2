<script setup>
// Texto com glitch cromático: duas cópias (ciano e azul) deslocadas e fatiadas em rajadas curtas.
import { ref, onBeforeUnmount } from 'vue'
import { gsap } from '../lib/gsap'

defineProps({ text: { type: String, required: true } })

const base = ref(null)
const cy = ref(null)
const bl = ref(null)
let tl
const rnd = gsap.utils.random
const slice = () => {
  const a = rnd(0, 70)
  const h = rnd(8, 30)
  return `inset(${a}% 0% ${100 - a - h}% 0%)`
}

function reset() {
  gsap.set([cy.value, bl.value], { autoAlpha: 0, x: 0, clipPath: 'inset(0% 0% 0% 0%)' })
  gsap.set(base.value, { x: 0, skewX: 0 })
}

function burst(power = 1) {
  if (!base.value) return
  tl?.kill()
  tl = gsap.timeline({ onComplete: reset })
  const steps = Math.round(rnd(3, 6))
  for (let i = 0; i < steps; i++) {
    const at = i * 0.05
    tl.set(cy.value, { autoAlpha: 0.9, x: rnd(-9, 9) * power, clipPath: slice() }, at)
      .set(bl.value, { autoAlpha: 0.85, x: rnd(-9, 9) * power, clipPath: slice() }, at)
      .set(base.value, { x: rnd(-3, 3) * power, skewX: rnd(-8, 8) * power }, at)
  }
  tl.set({}, {}, steps * 0.05) // garante o reset ao final
}

onBeforeUnmount(() => tl?.kill())
defineExpose({ burst })
</script>

<template>
  <div class="gt">
    <span ref="base" class="base">{{ text }}</span>
    <span ref="cy" class="ghost cy" aria-hidden="true">{{ text }}</span>
    <span ref="bl" class="ghost bl" aria-hidden="true">{{ text }}</span>
  </div>
</template>

<style scoped>
.gt {
  position: relative;
  display: inline-block;
  white-space: nowrap;
}
.base {
  display: block;
}
.ghost {
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  visibility: hidden;
  mix-blend-mode: screen;
  pointer-events: none;
}
.cy {
  color: var(--cyan);
}
.bl {
  color: var(--electric);
}
</style>
