/* Tema compartido: colores leídos de las variables CSS (claro/oscuro), valores por defecto de Chart.js
   y helpers para crear gráficas. Se carga primero; el resto de módulos cuelga de window.Graficas. */
window.Graficas = (function () {
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const tema = {
    tinta: css('--ink'), gris: css('--mut'), linea: css('--line'),
    serie: [1, 2, 3, 4, 5, 6].map(i => css('--c' + i)),   // 0 verde azulado, 1 naranja, 2 mostaza, 3 morado, 4 oliva, 5 gris
  };
  Chart.defaults.color = tema.gris;
  Chart.defaults.font.family = 'system-ui, sans-serif';
  Chart.defaults.borderColor = tema.linea;
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;

  const crear = (id, cfg) => new Chart(document.getElementById(id), cfg);
  const NOMBRES = { 'Cafe molido': 'Café molido', 'Bebida energetica': 'Bebida energética' };
  return {
    tema,
    nombre: p => NOMBRES[p] || p,
    crear,
    /* Gráfica de una sola serie de barras (horizontal si horizontal = true). */
    barras(id, etiquetas, datos, colores, horizontal) {
      return crear(id, { type: 'bar',
        data: { labels: etiquetas, datasets: [{ data: datos, backgroundColor: colores, borderRadius: 3 }] },
        options: { indexAxis: horizontal ? 'y' : 'x', plugins: { legend: { display: false } } } });
    },
  };
})();
