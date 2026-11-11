// Estilo e tempo de entrada do texto, idênticos aos da abertura (HeroSection).
// Todas as cenas usam estes valores para que as letras apareçam do mesmo jeito.
export const REVEAL = {
  // Títulos: cada linha sobe de dentro de uma máscara.
  title: { duration: 1.8, stagger: 0.25, ease: 'expo.out' },
  // Frases, descrições, itens: surgem com fade + leve subida.
  fade: { duration: 1.6, ease: 'power2.out' },
  fadeFrom: { autoAlpha: 0, y: 16 },
  // Intervalo entre a frase e a descrição (igual ao da abertura).
  fadeStagger: 0.8,
  // Intervalo entre os itens de uma lista.
  itemStagger: 0.45,
}
