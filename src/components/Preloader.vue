<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import GlitchText from './GlitchText.vue'

const props = defineProps({ progress: { type: Number, default: 0 } })
const emit = defineEmits(['reveal', 'closed'])

const root = ref(null)
const top = ref(null)
const bottom = ref(null)
const fx = ref(null)
const wordA = ref(null)
const wordB = ref(null)
const g1 = ref(null)
const g2 = ref(null)
const track = ref(null)
const bar = ref(null)
const spark = ref(null)
const meta = ref(null)
const label = ref(null)
const pct = ref(null)

const reduced = prefersReducedMotion()
const display = { v: 0 }
// A barra NUNCA passa do progresso real; só limita a velocidade visual para que o preenchimento
// de 0 a 100% seja visível mesmo quando tudo carrega instantaneamente (arquivos locais).
const RATE = 0.42 // fração por segundo
let real = props.progress
let started = false
let introDone = false
let finished = false
let glitchCall
let ctx

watch(
  () => props.progress,
  (v) => (real = v),
)

function render() {
  if (!pct.value) return
  pct.value.textContent = `${String(Math.round(display.v * 100)).padStart(2, '0')} — 100%`
  bar.value.style.transform = `scaleX(${display.v})`
  spark.value.style.left = `${display.v * 100}%`
}

function tick(time, dt) {
  if (!started || finished) return
  if (display.v < real) {
    const wobble = 0.55 + 0.9 * Math.abs(Math.sin(time * 2.7) * Math.cos(time * 1.3))
    display.v = Math.min(real, display.v + (Math.min(dt, 50) / 1000) * RATE * wobble)
    render()
  }
  if (display.v >= 0.999 && real >= 0.999 && introDone) finish()
}

const setLabel = (text, duration = 1.1) => {
  if (!label.value) return
  if (reduced) label.value.textContent = text
  else gsap.to(label.value, { duration, ease: 'none', scrambleText: { text, chars: '01', speed: 0.6, revealDelay: 0.1 } })
}

function glitchLoop() {
  if (finished || reduced) return
  const r = Math.random()
  if (r < 0.5) g1.value?.burst(0.7 + Math.random() * 0.6)
  else g2.value?.burst(0.7 + Math.random() * 0.6)
  if (r > 0.72) {
    g1.value?.burst(0.8)
    g2.value?.burst(0.8)
  }
  gsap.fromTo(pct.value, { x: -2, opacity: 0.55 }, { x: 0, opacity: 1, duration: 0.14 })
  glitchCall = gsap.delayedCall(gsap.utils.random(0.55, 1.35), glitchLoop)
}

function finish() {
  finished = true
  glitchCall?.kill()
  gsap.ticker.remove(tick)
  display.v = 1
  render()
  const dy = reduced ? 0 : -14
  const tl = gsap.timeline()
  tl.add(() => {
    if (!reduced) {
      g1.value?.burst(2.2)
      g2.value?.burst(2.2)
    }
    setLabel('EXPERIENCE READY', 0.6)
  }, 0)
  tl.to({}, { duration: reduced ? 0.2 : 0.7 })
  tl.to([wordA.value, wordB.value, track.value, meta.value], { autoAlpha: 0, y: dy, duration: 0.7, stagger: 0.06, ease: 'power2.in' })
  tl.to(fx.value, { autoAlpha: 0, duration: 0.5 }, '<')
  tl.add(() => emit('reveal'), '>-0.1')
  if (reduced) {
    tl.to(root.value, { autoAlpha: 0, duration: 0.5 })
  } else {
    // Cortina cinematográfica: duas metades se afastam a partir do centro.
    tl.to(top.value, { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, '<')
    tl.to(bottom.value, { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, '<')
  }
  tl.add(() => emit('closed'))
}

onMounted(() => {
  ctx = gsap.context(() => {
    const dy = reduced ? 0 : 18
    gsap.set([wordA.value, wordB.value, meta.value, track.value, fx.value], { autoAlpha: 0 })
    gsap.set(wordA.value, { y: dy })
    gsap.set(wordB.value, { y: dy * 1.6 })
    label.value.textContent = ''
    render()

    const intro = gsap.timeline({ onComplete: () => (introDone = true) })
    intro
      .to(fx.value, { autoAlpha: 1, duration: 0.6 }, 0)
      .to(wordA.value, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 0.25)
      .add(() => !reduced && g1.value?.burst(1), 0.45)
      .to(wordB.value, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.75)
      .add(() => !reduced && g2.value?.burst(1.2), 0.95)
      .to([track.value, meta.value], { autoAlpha: 1, duration: 0.6 }, 0.9)
      .add(() => {
        started = true
        setLabel('INITIALIZING EXPERIENCE', 1.3)
      }, 1.0)
      .add(glitchLoop, 1.5)
      .to({}, { duration: 0.1 }, 2.1)
    gsap.ticker.add(tick)
  }, root.value)
})

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  glitchCall?.kill()
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="fixed inset-0 z-[100] text-ink" role="status" aria-label="Carregando a experiência FUTURE 2050">
    <div ref="top" class="absolute inset-x-0 top-0 h-1/2 bg-void" />
    <div ref="bottom" class="absolute inset-x-0 bottom-0 h-1/2 bg-void" />
    <div ref="fx" class="pre-fx" aria-hidden="true"><i class="band" /></div>

    <div class="absolute inset-0 flex flex-col items-center justify-center px-6" aria-hidden="true">
      <div class="text-center">
        <div ref="wordA">
          <GlitchText ref="g1" text="FUTURE" class="font-display font-light leading-none" style="font-size: clamp(2.1rem, 6.4vw, 5.2rem); letter-spacing: 0.34em; margin-right: -0.34em" />
        </div>
        <div ref="wordB" style="margin-top: 0.35rem">
          <GlitchText ref="g2" text="2050" class="font-display font-semibold leading-none" style="font-size: clamp(3.4rem, 12vw, 9.5rem); letter-spacing: -0.02em" />
        </div>
      </div>

      <div class="mt-14 w-[min(22rem,72vw)]">
        <div ref="track" class="track">
          <div ref="bar" class="bar" />
          <i ref="spark" class="spark" />
        </div>
        <div ref="meta" class="mt-4 flex items-center justify-between text-[0.68rem] text-mute" style="letter-spacing: 0.22em">
          <span ref="label" />
          <span ref="pct" class="tabular-nums" style="letter-spacing: 0.12em">00 — 100%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pre-fx {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(244, 246, 250, 0.035) 0, rgba(244, 246, 250, 0.035) 1px, transparent 1px, transparent 3px);
}
.band {
  position: absolute;
  left: 0;
  right: 0;
  top: -22%;
  height: 22%;
  background: linear-gradient(180deg, transparent, rgba(86, 228, 242, 0.07), transparent);
  animation: band 3.2s linear infinite;
}
@keyframes band {
  to {
    transform: translateY(560%);
  }
}
.track {
  position: relative;
  height: 1px;
  width: 100%;
  background: rgba(244, 246, 250, 0.14);
}
.bar {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform: scaleX(0);
  background: linear-gradient(90deg, #367bff, #56e4f2);
  box-shadow: 0 0 14px rgba(86, 228, 242, 0.55);
}
.spark {
  position: absolute;
  top: -2px;
  left: 0;
  width: 5px;
  height: 5px;
  margin-left: -2px;
  border-radius: 50%;
  background: var(--ink);
  box-shadow: 0 0 12px 3px rgba(86, 228, 242, 0.8);
}
@media (prefers-reduced-motion: reduce) {
  .band {
    animation: none;
    display: none;
  }
}
</style>
