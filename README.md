# FUTURE 2050

Experiência web cinematográfica guiada pelo scroll, em **Vue 3 + Vite + Tailwind CSS 4 + GSAP (ScrollTrigger)**.

Preloader com progresso real e glitch → Terra → Inteligência Artificial → Cidades → Medicina → Profissões → Educação → Transporte → Encerramento.

## Rodar localmente

```bash
npm install
npm run dev        # desenvolvimento (http://localhost:5173)
npm run build      # gera dist/
npm run preview    # serve o build para testar
```

Requer Node 18+ (testado com Node 22).

## Como funciona

- **Scroll vertical contínuo.** A câmera (zoom e panorâmica), a entrada de cada cena e a saída (escurecimento) seguem o scroll.
- **Texto com o mesmo estilo e tempo em todas as cenas**: as letras sobem de dentro de uma máscara e as frases entram com fade, exatamente como na abertura
  (valores em `src/lib/reveal.js`). O texto dispara quando a cena ocupa a tela.
- Navegação lateral (pontos), indicador de progresso e "ano" de 2026 a 2050 acompanhando o scroll.
- `prefers-reduced-motion`: sem pin nem animação; todo o conteúdo fica visível e estático.

## Imagens

As 8 imagens estão em `public/images/` (WebP):

| Cena | Arquivo |
|---|---|
| Abertura (Terra) | `terra.webp` |
| Inteligência Artificial | `ia.webp` |
| Cidades do Futuro | `cidade.webp` |
| Medicina | `medicina.webp` |
| Profissões | `profissoes.webp` |
| Educação | `educacao.webp` |
| Transporte | `transporte.webp` |
| Encerramento | `encerramento.webp` |

Para trocar uma imagem, substitua o arquivo mantendo o nome (aceita `.webp`, `.avif`, `.jpg`, `.png`).
Se a nova imagem tiver outra proporção, atualize `ar` (largura/altura) da cena em `src/data/sections.js`;
se a composição mudar, ajuste também `motion.origin`, `focus` (IA), `sparks` (Medicina) e `fg.mask` (Transporte).
**Recomendado: 16:9 com pelo menos 1920×1080 (ideal 2560×1440).**
Os arquivos originais enviados ficam em `originals/` (backup local; não vão para o Git nem para o site).

## Ajustes rápidos (`src/data/sections.js`)

`length` (quanto scroll a cena ocupa, em vh), `side`/`valign` (posição do texto), `motion` (zoom/pan: `origin`, `from`, `to`),
`enter` (tipo de entrada da cena), textos e itens com `status` (existente / em desenvolvimento / possibilidade futura).

## Deploy

O projeto usa caminhos **relativos** (`base: './'`), então o mesmo build funciona no GitHub Pages (em subpasta), na Vercel e em domínio próprio.

### GitHub Pages (já configurado)

1. Crie um repositório no GitHub (ex.: `future-2050`) e envie o projeto:
   ```bash
   git init
   git add .
   git commit -m "FUTURE 2050"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/future-2050.git
   git push -u origin main
   ```
2. No repositório: **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. O workflow `.github/workflows/deploy.yml` roda a cada push na `main`. Acompanhe na aba **Actions**.
4. Quando terminar, o site fica em `https://SEU-USUARIO.github.io/future-2050/`.

Observações: em contas gratuitas o repositório precisa ser **público** para usar o Pages. Se algo falhar, abra a aba Actions e veja o log do passo que ficou vermelho.

### Vercel (alternativa)

1. Em vercel.com: **Add New → Project** e importe o repositório do GitHub.
2. A Vercel detecta o Vite sozinha (Build: `npm run build`, Output: `dist`; o `vercel.json` já define isso e o cache das imagens).
3. **Deploy.** O site fica em `https://nome-do-projeto.vercel.app`.

## Estrutura

```
src/
  components/  Preloader (+GlitchText), HeroSection, FutureSection (cenas), FooterSection (encerramento),
               Navigation, ProgressIndicator, SceneImage, SectionTransition
  composables/ useBootstrap (progresso real do carregamento)
  lib/         gsap.js, reveal.js (estilo/tempo do texto), assets.js, motion.js, config.js
  data/        sections.js
.github/workflows/deploy.yml   deploy automático no GitHub Pages
vercel.json                    configuração da Vercel
```

## Notas técnicas

- O preloader mostra o progresso **real** (bytes da imagem de abertura + fontes + página) e nunca exibe mais do que foi carregado;
  só limita a velocidade visual para o preenchimento ser visível. Timeout de segurança de 9 s.
- Cada componente cria suas animações dentro de `gsap.context` e as destrói ao desmontar.
- Imagens das cenas seguintes são carregadas sob demanda (a ~2,5 telas de distância).
- Vídeos opcionais: `public/videos/<nome>.mp4` + `video: true` na cena (toca mudo, em loop, por cima da imagem).
