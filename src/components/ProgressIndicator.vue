<script setup>
// Progresso da jornada: uma linha fina na base e o "ano" que avança de 2026 até 2050 com o scroll.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ScrollTrigger } from '../lib/gsap'
import { START_YEAR, END_YEAR } from '../lib/config'

defineProps({ visible: { type: Boolean, default: false } })

const bar = ref(null)
const year = ref(null)
let trigger

onMounted(() => {
  trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const p = self.progress
      bar.value.style.transform = `scaleX(${p})`
      year.value.textContent = Math.round(START_YEAR + p * (END_YEAR - START_YEAR))
    },
  })
})

onBeforeUnmount(() => trigger?.kill())
</script>

<template>
  <div class="progress" :class="{ 'is-visible': visible }" aria-hidden="true">
    <div ref="bar" class="bar" />
    <span ref="year" class="year">2026</span>
  </div>
</template>

<style scoped>
.progress {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 90;
  height: 3.2rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease 0.8s;
}
.progress.is-visible {
  opacity: 1;
}
.bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, var(--electric), var(--cyan));
  box-shadow: 0 0 12px rgba(86, 228, 242, 0.5);
}
.year {
  position: absolute;
  left: clamp(1.5rem, 6vw, 6rem);
  bottom: 1.3rem;
  font-family: var(--display);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(5, 6, 8, 0.9);
}
@media (prefers-reduced-motion: reduce) {
  .progress {
    transition: none;
  }
}
</style>
