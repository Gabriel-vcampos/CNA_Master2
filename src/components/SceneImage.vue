<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { resolveImage, resolveVideo } from '../lib/assets'

const props = defineProps({
  name: { type: String, required: true },
  alt: { type: String, default: '' },
  position: { type: String, default: '50% 50%' },
  positionMobile: { type: String, default: '' },
  eager: { type: Boolean, default: false },
  decorative: { type: Boolean, default: false },
  video: { type: Boolean, default: false }, // só procura public/videos/<nome>.mp4 se ligado
})

const root = ref(null)
const src = ref(null)
const videoSrc = ref(null)
const state = ref('idle') // idle | loading | ready | missing
let observer

async function load() {
  if (state.value !== 'idle') return
  state.value = 'loading'
  const url = await resolveImage(props.name)
  if (!url) {
    state.value = 'missing'
    return
  }
  src.value = url
  state.value = 'ready'
  if (props.video) resolveVideo(props.name).then((v) => (videoSrc.value = v))
}

onMounted(() => {
  if (props.eager || !('IntersectionObserver' in window)) return load()
  // Lazy: só resolve a imagem quando a cena está a ~2,5 telas de distância.
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        load()
        observer.disconnect()
      }
    },
    { rootMargin: '250% 0px' },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="scene-img" :style="{ '--pos': position, '--pos-m': positionMobile || position }">
    <img
      v-if="src"
      :src="src"
      :alt="decorative ? '' : alt"
      :aria-hidden="decorative ? 'true' : null"
      class="media-el"
      decoding="async"
      draggable="false"
    />
    <video
      v-if="videoSrc"
      :src="videoSrc"
      class="media-el"
      muted
      loop
      playsinline
      autoplay
      preload="metadata"
      aria-hidden="true"
    />
    <div v-if="state === 'missing'" class="placeholder" role="img" :aria-label="alt">
      <span class="ph-glow" />
      <span class="ph-text">
        <strong>Imagem pendente</strong>
        <code>public/images/{{ name }}.webp</code>
      </span>
    </div>
  </div>
</template>

<style scoped>
.scene-img {
  position: absolute;
  inset: 0;
}
.media-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--pos);
}
@media (max-width: 767px) {
  .media-el {
    object-position: var(--pos-m);
  }
}
.placeholder {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 50% 55%, rgba(54, 123, 255, 0.22), transparent 70%),
    linear-gradient(180deg, #07090d 0%, #050608 100%);
  display: grid;
  place-items: center;
}
.ph-glow {
  position: absolute;
  inset: 12%;
  border: 1px solid rgba(86, 228, 242, 0.14);
}
.ph-text {
  position: relative;
  display: grid;
  gap: 0.35rem;
  text-align: center;
  font-family: var(--sans);
  font-size: 0.8rem;
  color: var(--mute);
}
.ph-text strong {
  font-weight: 500;
  color: var(--ink);
}
.ph-text code {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  color: var(--cyan);
}
</style>
