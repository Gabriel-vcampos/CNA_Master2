import { ref } from 'vue'
import { loadEssentialImage } from '../lib/assets'

// Progresso real dos recursos essenciais: imagem de abertura (70%), fontes (20%), página (10%).
// Um timeout garante que o visitante nunca fique preso no preloader.
export function useBootstrap({ essentialImages = [], timeout = 9000 } = {}) {
  const progress = ref(0)
  const imgParts = essentialImages.map(() => 0)
  let fonts = 0
  let dom = document.readyState === 'complete' ? 1 : 0
  let forced = false

  const update = () => {
    const img = imgParts.length ? imgParts.reduce((a, b) => a + b, 0) / imgParts.length : 1
    const done = img >= 1 && fonts && dom
    progress.value = forced || done ? 1 : Math.min(0.99, img * 0.7 + fonts * 0.2 + dom * 0.1)
  }

  essentialImages.forEach((name, i) => {
    loadEssentialImage(name, (v) => {
      imgParts[i] = v
      update()
    })
      .catch(() => {})
      .finally(() => {
        imgParts[i] = 1
        update()
      })
  })

  Promise.all([
    document.fonts.load('600 1em "Space Grotesk Variable"'),
    document.fonts.load('400 1em "Inter Variable"'),
  ])
    .catch(() => {})
    .finally(() => {
      fonts = 1
      update()
    })

  if (!dom) {
    window.addEventListener(
      'load',
      () => {
        dom = 1
        update()
      },
      { once: true },
    )
  }

  setTimeout(() => {
    forced = true
    update()
  }, timeout)

  update()
  return { progress }
}
