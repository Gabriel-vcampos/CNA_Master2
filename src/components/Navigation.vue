<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motion'

const props = defineProps({
  items: { type: Array, required: true }, // [{ id, label }]
  visible: { type: Boolean, default: false },
})

const active = ref(0)
let triggers = []

onMounted(() => {
  props.items.forEach((item, i) => {
    const el = document.getElementById(item.id)
    if (!el) return
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => self.isActive && (active.value = i),
      }),
    )
  })
})

onBeforeUnmount(() => triggers.forEach((t) => t.kill()))

function go(item) {
  const el = document.getElementById(item.id)
  if (!el) return
  if (prefersReducedMotion()) {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
    return
  }
  gsap.to(window, { scrollTo: { y: el, autoKill: true }, duration: 1.8, ease: 'power3.inOut' })
}
</script>

<template>
  <nav class="nav" :class="{ 'is-visible': visible }" aria-label="Seções da experiência">
    <ol>
      <li v-for="(item, i) in items" :key="item.id">
        <button type="button" :class="{ 'is-active': active === i }" :aria-label="item.label" :aria-current="active === i ? 'true' : null" @click="go(item)">
          <span class="label">{{ item.label }}</span>
          <span class="tick" />
        </button>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  right: clamp(0.9rem, 2.2vw, 2rem);
  top: 50%;
  z-index: 90;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 1.2s ease 0.6s;
}
.nav.is-visible {
  opacity: 1;
  pointer-events: auto;
}
ol {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
button {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 0.55rem 0.2rem;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--mute);
  font-family: var(--sans);
  font-size: 0.72rem;
}
.label {
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(5, 6, 8, 0.9);
  pointer-events: none;
}
button:hover .label,
button:focus-visible .label,
button.is-active .label {
  opacity: 1;
  transform: none;
}
button.is-active .label {
  color: var(--ink);
}
.tick {
  display: block;
  width: 1px;
  height: 0.9rem;
  background: rgba(244, 246, 250, 0.38);
  transition: height 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.4s ease, box-shadow 0.4s ease;
}
button:hover .tick {
  background: rgba(244, 246, 250, 0.85);
}
button.is-active .tick {
  height: 1.9rem;
  background: var(--cyan);
  box-shadow: 0 0 10px rgba(86, 228, 242, 0.6);
}
@media (max-width: 767px) {
  .label {
    display: none;
  }
  button {
    padding: 0.4rem 0.3rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .nav,
  .label,
  .tick {
    transition: none;
  }
}
</style>
