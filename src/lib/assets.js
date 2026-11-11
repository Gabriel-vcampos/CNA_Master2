// Resolução de imagens/vídeos a partir de public/images e public/videos.
// Nada é inventado: se o arquivo não existir, devolve null e o componente mostra um placeholder.
const BASE = import.meta.env.BASE_URL
const EXTS = ['webp', 'avif', 'jpg', 'jpeg', 'png']
const imageCache = new Map()
const videoCache = new Map()

const probe = (url) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })

// Imagens das seções posteriores: carregadas sob demanda.
export function resolveImage(name) {
  if (!imageCache.has(name)) {
    imageCache.set(
      name,
      (async () => {
        for (const ext of EXTS) {
          const url = `${BASE}images/${name}.${ext}`
          if (await probe(url)) return url
        }
        return null
      })(),
    )
  }
  return imageCache.get(name)
}

// Imagem essencial (abertura): baixa com progresso REAL em bytes e reaproveita o blob.
export function loadEssentialImage(name, onProgress = () => {}) {
  const task = (async () => {
    for (const ext of EXTS) {
      const url = `${BASE}images/${name}.${ext}`
      try {
        const res = await fetch(url)
        const type = res.headers.get('content-type') || ''
        if (!res.ok || !type.startsWith('image')) {
          res.body?.cancel?.()
          continue
        }
        const total = Number(res.headers.get('content-length')) || 0
        if (!res.body || !total) {
          const blob = await res.blob()
          onProgress(1)
          return URL.createObjectURL(blob)
        }
        const reader = res.body.getReader()
        const chunks = []
        let received = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          received += value.length
          onProgress(Math.min(received / total, 1))
        }
        onProgress(1)
        return URL.createObjectURL(new Blob(chunks, { type }))
      } catch {
        /* tenta a próxima extensão */
      }
    }
    onProgress(1)
    return null
  })()
  imageCache.set(name, task)
  return task
}

// Vídeo opcional em loop (public/videos/<nome>.mp4). Só é usado se existir de verdade.
export function resolveVideo(name) {
  if (!videoCache.has(name)) {
    videoCache.set(
      name,
      (async () => {
        const url = `${BASE}videos/${name}.mp4`
        try {
          const res = await fetch(url, { method: 'HEAD' })
          const type = res.headers.get('content-type') || ''
          return res.ok && type.startsWith('video') ? url : null
        } catch {
          return null
        }
      })(),
    )
  }
  return videoCache.get(name)
}
