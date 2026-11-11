<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'
import { REVEAL } from '../lib/reveal'
import { STATUS_LABEL } from '../data/sections'
import SceneImage from './SceneImage.vue'
import SectionTransition from './SectionTransition.vue'

const props = defineProps({
  section: { type: Object, required: true },
  index: { type: Number, default: 1 },
})

const s = props.section
const root = ref(null)
const reduced = ref(false)
const hasStatus = s.groups.some((g) => g.lines.some((l) => l.status))
const isBand = s.side === 'top' || s.side === 'bottom'
const streaks = [
  { top: 12, w: 22 },
  { top: 21, w: 34 },
  { top: 72, w: 18 },
  { top: 79, w: 40 },
  { top: 86, w: 26 },
  { top: 92, w: 30 },
  { top: 17, w: 20 },
]

const frac = (p, i) => (parseFloat((p || '50% 50%').split(' ')[i]) || 50) / 100
const coverVars = computed(() => ({
  '--ar': s.ar,
  '--pxd': frac(s.position, 0),
  '--pyd': frac(s.position, 1),
  '--pxm': frac(s.positionMobile || s.position, 0),
  '--pym': frac(s.positionMobile || s.position, 1),
}))

let ctx

// Cada cena entra de um jeito próprio (variação com moderação).
function enterVars(e = { type: 'fade' }) {
  const at = e.at || '50% 60%'
  switch (e.type) {
    case 'iris':
      return [{ clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})` }]
    case 'slit':
      return [{ clipPath: 'inset(44% 0% 44% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }]
    case 'wipe-left':
      return [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }]
    case 'wipe-right':
      return [{ clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }]
    default:
      return [{ opacity: 0 }, { opacity: 1 }]
  }
}

function build() {
  const q = gsap.utils.selector(root.value)
  const titles = q('[data-title]')
  const tagline = q('[data-tagline]')
  const desc = q('[data-desc]')
  const legend = q('[data-legend]')
  const lines = q('[data-line]')
  const groups = q('[data-group]')
  const add = (targets, a, b, at) => targets.length && tl.fromTo(targets, a, b, at)

  // Estados iniciais do texto (a cena só aparece quando a entrada começa).
  gsap.set(titles, { yPercent: 115 })
  gsap.set([...tagline, ...desc, ...legend], { ...REVEAL.fadeFrom })
  gsap.set(lines, { ...REVEAL.fadeFrom })
  if (s.mode !== 'list') gsap.set(groups, { autoAlpha: 0, y: 24 })

  // ---- Texto: mesmo estilo e tempo da abertura. Dispara quando a cena já ocupa a tela. ----
  const reveal = gsap.timeline({ paused: true })
  let t = 0.3
  reveal.to(titles, { yPercent: 0, ...REVEAL.title }, t)
  t += 1.9 // a frase entra 1,9 s depois do título, como na abertura
  reveal.to(tagline, { autoAlpha: 1, y: 0, ...REVEAL.fade }, t)
  if (desc.length) {
    t += REVEAL.fadeStagger
    reveal.to(desc, { autoAlpha: 1, y: 0, ...REVEAL.fade }, t)
  }
  if (s.mode === 'list') {
    t += REVEAL.fadeStagger
    reveal.to(lines, { autoAlpha: 1, y: 0, ...REVEAL.fade, stagger: REVEAL.itemStagger }, t)
    t += REVEAL.itemStagger * lines.length
  }
  if (legend.length) reveal.to(legend, { autoAlpha: 1, y: 0, ...REVEAL.fade }, t + 0.2)
  ScrollTrigger.create({
    trigger: root.value,
    start: 'top 30%',
    onEnter: () => reveal.play(),
    onLeaveBack: () => reveal.pause(0),
  })

  // ---- Grupos (Profissões / Educação): entram conforme o scroll avança, com o mesmo estilo. ----
  const TH = s.mode === 'sequence' ? [0.26, 0.5, 0.74] : [0.26, 0.44, 0.62]
  const showGroup = (g, on) => {
    if (g._on === on) return
    g._on = on
    const gl = g.querySelectorAll('[data-line]')
    if (on) {
      gsap.fromTo(g, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ...REVEAL.fade, overwrite: 'auto' })
      gsap.fromTo(gl, { ...REVEAL.fadeFrom }, { autoAlpha: 1, y: 0, ...REVEAL.fade, stagger: 0.2, delay: 0.3, overwrite: 'auto' })
    } else {
      gsap.to(g, { autoAlpha: 0, y: -18, duration: 0.8, ease: 'power2.in', overwrite: 'auto' })
    }
  }
  let descOn = true
  const onProgress = (p) => {
    if (s.mode === 'sequence') {
      let k = -1
      TH.forEach((th, i) => p >= th && (k = i))
      groups.forEach((g, i) => showGroup(g, i === k))
      const wantDesc = k < 0
      if (desc.length && wantDesc !== descOn) {
        descOn = wantDesc
        gsap.to(desc, { autoAlpha: wantDesc ? 1 : 0, y: 0, duration: wantDesc ? REVEAL.fade.duration : 0.8, ease: 'power2.out', overwrite: 'auto' })
      }
    } else if (s.mode === 'stack') {
      groups.forEach((g, i) => showGroup(g, p >= TH[i]))
    }
  }

  // ---- 1) Entrada: acontece enquanto a cena sobe pela tela, sobrepondo a anterior. ----
  const [from, to] = enterVars(s.enter)
  gsap.fromTo(q('.clip'), from, {
    ...to,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top 95%', end: 'top 8%', scrub: true },
  })

  // ---- 2) Cena fixa: movimento de câmera guiado pelo scroll. ----
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root.value,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.9,
      onUpdate: (self) => onProgress(self.progress),
    },
  })
  const m = s.motion
  tl.fromTo(q('.layer-bg'), { transformOrigin: m.origin, ...m.from }, { ...m.to, duration: 1 }, 0)
  if (s.fg) tl.fromTo(q('.layer-fg'), { transformOrigin: s.fg.origin, ...s.fg.from }, { ...s.fg.to, duration: 1 }, 0)

  // Detalhes específicos de cada cena.
  const glow = q('.glow')
  if (glow.length) {
    // O ponto de luz entre os dedos nasce e cresce com o scroll: o encontro entre humano e máquina.
    add(glow, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.3)
    tl.to(glow, { scale: 1.9, duration: 0.45, ease: 'sine.inOut' }, 0.5)
    gsap.to(q('.glow-core'), { scale: 1.3, opacity: 0.65, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }
  q('.spark').forEach((el, i) => {
    add([el], { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.06, ease: 'power2.out' }, 0.3 + i * 0.07)
    gsap.to(el, { y: -10, duration: 2.6 + i * 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  })
  if (s.speed) {
    q('.streak').forEach((el, i) => {
      gsap.fromTo(el, { xPercent: -140 }, { xPercent: 260, duration: 2.4 + (i % 4) * 0.7, repeat: -1, ease: 'none', delay: -(i * 0.63) })
    })
    add(q('.speed'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0.15)
    tl.to(q('.speed'), { autoAlpha: 0, duration: 0.1 }, 0.78)
  }

  // ---- 3) Saída: texto some, a cena escurece e cede espaço para a próxima. ----
  tl.to(q('.content'), { autoAlpha: 0, y: -30, duration: 0.07, ease: 'power1.in' }, 0.84)
  tl.to(q('.veil'), { opacity: 1, duration: 0.14 }, 0.86)
}

onMounted(() => {
  reduced.value = prefersReducedMotion()
  if (reduced.value) return
  ctx = gsap.context(build, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section :id="s.id" ref="root" class="scene" :class="{ 'is-static': reduced }" :style="{ '--len': s.length, zIndex: index }" :aria-labelledby="s.id + '-title'">
    <SectionTransition :variant="s.seam" />

    <div class="stage">
      <div class="clip">
        <div class="layer layer-bg">
          <SceneImage :name="s.image" :alt="s.alt" :position="s.position" :position-mobile="s.positionMobile" :video="!!s.video" />
          <div v-if="s.focus || s.sparks" class="cover" :style="coverVars" aria-hidden="true">
            <div v-if="s.focus" class="glow" :style="{ left: s.focus.x + '%', top: s.focus.y + '%', '--g': s.focus.size + 'vmin' }">
              <span class="glow-core" />
            </div>
            <span v-for="(p, i) in s.sparks || []" :key="i" class="spark" :style="{ left: p.x + '%', top: p.y + '%' }" />
          </div>
        </div>
        <div v-if="s.fg" class="layer layer-fg" :style="{ '--mask': s.fg.mask }" aria-hidden="true">
          <SceneImage :name="s.image" :position="s.position" :position-mobile="s.positionMobile" decorative />
        </div>
        <div v-if="s.speed" class="speed" aria-hidden="true">
          <i v-for="(k, i) in streaks" :key="i" class="streak" :style="{ top: k.top + '%', width: k.w + 'vw' }" />
        </div>
      </div>

      <div class="shade" :class="['shade-' + s.side, { strong: s.strong }]" :style="{ '--sa': s.shade ?? 1 }" />
      <div class="veil" />

      <div class="content" :class="['side-' + s.side, 'v-' + s.valign, { 'side-band': isBand }]">
        <h2 :id="s.id + '-title'" class="title">
          <span v-for="(line, i) in s.title" :key="i" class="mask"><span class="inner" data-title>{{ line }}</span></span>
        </h2>
        <p class="tagline" data-tagline>{{ s.tagline }}</p>
        <p v-if="s.desc" class="desc" data-desc>{{ s.desc }}</p>

        <div class="groups" :class="'mode-' + s.mode">
          <div v-for="(g, gi) in s.groups" :key="gi" class="group" data-group>
            <h3 v-if="g.title" class="group-title">{{ g.title }}</h3>
            <ul class="lines">
              <li v-for="(l, li) in g.lines" :key="li" class="line" data-line>
                <span v-if="l.status" class="mark" :class="'mark-' + l.status" aria-hidden="true" />
                <span>{{ l.text }}<span v-if="l.status" class="sr-only"> ({{ STATUS_LABEL[l.status] }})</span></span>
              </li>
            </ul>
          </div>
        </div>

        <p v-if="hasStatus" class="legend" data-legend>
          <span v-for="(label, key) in STATUS_LABEL" :key="key"><i class="mark" :class="'mark-' + key" aria-hidden="true" />{{ label }}</span>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scene {
  position: relative;
  height: calc(var(--len) * 1svh);
  margin-top: -55svh;
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
  overflow: hidden;
}
.layer {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.layer-bg {
  container-type: size;
}
.layer-fg {
  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
}
.shade,
.veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.shade-left {
  background:
    linear-gradient(90deg, rgba(5, 6, 8, 0.88) 0%, rgba(5, 6, 8, 0.52) 38%, transparent 70%),
    linear-gradient(0deg, rgba(5, 6, 8, 0.55) 0%, transparent 36%);
}
.shade-right {
  background:
    linear-gradient(270deg, rgba(5, 6, 8, 0.88) 0%, rgba(5, 6, 8, 0.52) 38%, transparent 70%),
    linear-gradient(0deg, rgba(5, 6, 8, 0.55) 0%, transparent 36%);
}
.shade-bottom {
  background: linear-gradient(0deg, rgba(5, 6, 8, 0.95) 0%, rgba(5, 6, 8, 0.84) 26%, rgba(5, 6, 8, 0.4) 44%, transparent 60%);
}
.shade-top {
  background: linear-gradient(
    180deg,
    rgba(5, 6, 8, calc(0.94 * var(--sa, 1))) 0%,
    rgba(5, 6, 8, calc(0.82 * var(--sa, 1))) 26%,
    rgba(5, 6, 8, calc(0.4 * var(--sa, 1))) 44%,
    transparent 60%
  );
}
.shade.strong::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(5, 6, 8, 0.24);
}
.veil {
  background: var(--void);
  opacity: 0;
}

/* Conteúdo */
.content {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  width: min(34rem, 88vw);
  padding-block: clamp(3rem, 10svh, 7rem);
}
.side-left {
  left: clamp(1.5rem, 6vw, 6rem);
}
.side-right {
  right: clamp(3rem, 8vw, 7.5rem);
}
.v-end {
  justify-content: flex-end;
}
.v-center {
  justify-content: center;
}
.v-start {
  justify-content: flex-start;
}
/* Título no alto, descrição e lista embaixo: libera o centro (ex.: trem). */
.v-split {
  justify-content: flex-start;
}
.v-split .desc {
  margin-top: auto;
}
.v-split .groups {
  margin-top: 1.2rem;
}

/* Faixas superior/inferior: título | frase e descrição | lista. Libera o centro da imagem. */
.content.side-band {
  left: clamp(1.5rem, 6vw, 6rem);
  right: clamp(4rem, 8vw, 7.5rem);
  width: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto auto;
  column-gap: clamp(1.5rem, 3.5vw, 3.5rem);
}
.content.side-bottom {
  top: auto;
  bottom: 0;
  align-items: end;
  padding-block: 0 clamp(2.2rem, 6svh, 4.5rem);
}
.content.side-top {
  top: 0;
  bottom: auto;
  align-items: start;
  padding-block: clamp(2.2rem, 6svh, 4.5rem) 0;
}
.side-band .title {
  grid-column: 1;
  grid-row: 1 / 4;
}
.side-band .tagline {
  grid-column: 2;
  grid-row: 1;
  margin-top: 0;
}
.side-band .desc {
  grid-column: 2;
  grid-row: 2;
}
.side-band .groups {
  grid-column: 3;
  grid-row: 1 / 3;
  margin-top: 0;
  max-width: none;
}
.side-band .legend {
  grid-column: 3;
  grid-row: 3;
}

.title {
  margin: 0;
  font-family: var(--display);
  font-weight: 600;
  font-size: clamp(2.2rem, 4.6vw, 4.4rem);
  line-height: 0.96;
  letter-spacing: -0.025em;
}
.mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}
.inner {
  display: block;
}
.tagline {
  margin: 1.4rem 0 0;
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(1.05rem, 1.55vw, 1.45rem);
  line-height: 1.3;
}
.tagline,
.desc,
.line,
.legend {
  text-shadow: 0 1px 16px rgba(5, 6, 8, 0.9);
}
.desc {
  margin: 0.9rem 0 0;
  max-width: 27rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgba(244, 246, 250, 0.78);
}

.groups {
  margin-top: 1.8rem;
  max-width: 27rem;
}
.mode-sequence {
  display: grid;
  align-content: start;
}
.mode-sequence .group {
  grid-area: 1 / 1;
}
.mode-stack .group + .group {
  margin-top: 1.4rem;
}
.group-title {
  margin: 0 0 0.7rem;
  padding-top: 0.9rem;
  border-top: 2px solid var(--electric);
  width: 3.2rem;
  white-space: nowrap;
  font-family: var(--display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
}
.lines {
  margin: 0;
  padding: 0;
  list-style: none;
}
.line {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(244, 246, 250, 0.12);
  font-size: 0.96rem;
  line-height: 1.45;
}
.group-title + .lines .line:first-child,
.mode-list .lines .line:first-child {
  border-top-color: rgba(244, 246, 250, 0.2);
}

/* Marcadores de status: existente / em desenvolvimento / possibilidade */
.mark {
  flex: none;
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  border: 1px solid var(--cyan);
  transform: translateY(-1px);
}
.mark-exists {
  background: var(--cyan);
}
.mark-developing {
  background: linear-gradient(90deg, var(--cyan) 50%, transparent 50%);
}
.mark-possible {
  border-style: dashed;
  background: transparent;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.2rem;
  margin: 1.3rem 0 0;
  font-size: 0.74rem;
  color: var(--mute);
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

/* Efeitos de cena. A caixa .cover tem a proporção da imagem e acompanha o object-position,
   então glow e sparks ficam presos ao conteúdo da imagem em qualquer tamanho de tela. */
.cover {
  --px: var(--pxd);
  --py: var(--pyd);
  --bw: max(100cqw, calc(100cqh * var(--ar)));
  --bh: calc(var(--bw) / var(--ar));
  position: absolute;
  width: var(--bw);
  height: var(--bh);
  left: calc((100cqw - var(--bw)) * var(--px));
  top: calc((100cqh - var(--bh)) * var(--py));
  pointer-events: none;
}
.glow {
  position: absolute;
  width: var(--g);
  height: var(--g);
  margin: calc(var(--g) / -2) 0 0 calc(var(--g) / -2);
  opacity: 0;
  pointer-events: none;
}
.glow-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, rgba(86, 228, 242, 0.85) 8%, rgba(54, 123, 255, 0.35) 28%, transparent 66%);
}
.spark {
  position: absolute;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 14px 4px rgba(86, 228, 242, 0.55);
  opacity: 0;
  pointer-events: none;
}
.speed {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}
.streak {
  position: absolute;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(86, 228, 242, 0.5), transparent);
}

/* Modo estático (prefers-reduced-motion): tudo visível, sem pin nem scrub */
.scene.is-static {
  height: auto;
  min-height: 100svh;
  margin-top: 0;
}
.is-static .stage {
  position: relative;
}
.is-static .glow,
.is-static .spark {
  opacity: 1;
}

@media (max-width: 767px) {
  .scene {
    height: calc(var(--len) * 0.82svh);
  }
  .cover {
    --px: var(--pxm);
    --py: var(--pym);
  }
  .content,
  .content.side-band {
    top: 0;
    bottom: 0;
    left: 1.5rem;
    right: 1.5rem;
    width: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
    padding-block: 3.5rem 4rem;
  }
  .content.side-top {
    justify-content: flex-start;
    padding-block: 3.5rem 0;
  }
  .side-band .groups,
  .groups {
    margin-top: 1.1rem;
    max-width: none;
  }
  .side-band .tagline,
  .tagline {
    margin-top: 1rem;
  }
  .v-split .desc {
    margin-top: 0.9rem;
  }
  /* Celular: texto enxuto para não cobrir o elemento principal da imagem */
  .desc {
    display: none;
  }
  .title {
    font-size: clamp(2rem, 10.5vw, 3rem);
  }
  .line {
    padding: 0.38rem 0;
    font-size: 0.9rem;
  }
  .legend {
    margin-top: 0.9rem;
  }
  .shade-left,
  .shade-right,
  .shade-bottom {
    background: linear-gradient(0deg, rgba(5, 6, 8, 0.92) 0%, rgba(5, 6, 8, 0.6) 44%, transparent 76%);
  }
  .shade-top {
    background: linear-gradient(180deg, rgba(5, 6, 8, calc(0.92 * var(--sa, 1))) 0%, rgba(5, 6, 8, calc(0.6 * var(--sa, 1))) 44%, transparent 76%);
  }
}
</style>
