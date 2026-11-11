<script setup>
import { ref } from 'vue'
import { ScrollTrigger } from './lib/gsap'
import { sections } from './data/sections'
import { useBootstrap } from './composables/useBootstrap'
import Preloader from './components/Preloader.vue'
import HeroSection from './components/HeroSection.vue'
import FutureSection from './components/FutureSection.vue'
import FooterSection from './components/FooterSection.vue'
import Navigation from './components/Navigation.vue'
import ProgressIndicator from './components/ProgressIndicator.vue'

// O carregamento dos recursos essenciais começa já no setup, antes de qualquer componente montar.
const { progress } = useBootstrap({ essentialImages: ['terra'] })

const loading = ref(true)
const revealed = ref(false)

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
document.documentElement.classList.add('is-loading')

const navItems = [
  { id: 'hero', label: 'Openning' },
  ...sections.map((s) => ({ id: s.id, label: s.nav })),
  { id: 'encerramento', label: 'Closing' },
]

function onReveal() {
  window.scrollTo(0, 0)
  document.documentElement.classList.remove('is-loading')
  revealed.value = true
  ScrollTrigger.refresh()
}

function onClosed() {
  loading.value = false
  ScrollTrigger.refresh()
}
</script>

<template>
  <Preloader v-if="loading" :progress="progress" @reveal="onReveal" @closed="onClosed" />

  <main>
    <HeroSection :ready="revealed" />
    <FutureSection v-for="(section, i) in sections" :key="section.id" :section="section" :index="i + 1" />
    <FooterSection :index="sections.length + 1" />
  </main>

  <ProgressIndicator :visible="revealed" />
  <Navigation :items="navItems" :visible="revealed" />
</template>
