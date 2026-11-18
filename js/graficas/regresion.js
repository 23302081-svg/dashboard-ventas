/* Sección 1: regresión. Línea real vs. modelo (con selector de producto) y barras de MAPE. */
Graficas.regresion = function (D) {
  const { tema, nombre, crear, barras } = Graficas;
  const UMBRAL_BUENO = 5, UMBRAL_MALO = 7;            // MAPE (%) para colorear productos
  const ETIQ_MODELO = { modelo_ols_estacional: 'OLS × estacional', base_ingenuo_estacional: 'Ingenuo estacional',
                        base_media_movil_12: 'Media móvil 12', base_ingenuo: 'Ingenuo' };
  const N_TRAIN = D.train_fin;

  let grafica;
  function datasets(p) {
    const d = D.productos[p], total = D.etiquetas.length, n = d.real.length;  // n = fin de la historia
    const real = d.real.concat(Array(total - n).fill(null));
    const tramo = (a, b) => d.estimado.map((v, i) => (i >= a && i <= b ? v : null));
    return [
      { label: 'Real', data: real, borderColor: tema.tinta, pointRadius: 0, borderWidth: 1.8 },
      { label: 'Ajuste (entrenamiento)', data: tramo(0, N_TRAIN - 1), borderColor: tema.serie[0], pointRadius: 0, borderWidth: 1.5 },
      { label: 'Prueba', data: tramo(N_TRAIN - 1, n - 1), borderColor: tema.serie[1], pointRadius: 0, borderWidth: 2.5 },
      { label: 'Proyección', data: tramo(n - 1, total - 1), borderColor: tema.serie[1], borderDash: [6, 4], pointRadius: 0, borderWidth: 2.5 },
    ];
  }
  function dibujar(p) {
    if (grafica) { grafica.data.datasets = datasets(p); grafica.update(); return; }
    grafica = crear('ch1', { type: 'line', data: { labels: D.etiquetas, datasets: datasets(p) },
      options: { interaction: { mode: 'index', intersect: false },
                 scales: { x: { ticks: { maxTicksLimit: 10 } }, y: { title: { display: true, text: 'unidades' } } } } });
  }
  const tabs = document.getElementById('tp');
  Object.keys(D.productos).forEach((p, i) => {
    const b = document.createElement('button');
    b.textContent = nombre(p);
    b.onclick = () => { [...tabs.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); dibujar(p); };
    tabs.appendChild(b);
    if (!i) b.click();
  });

  const m = D.modelos;
  barras('ch2', m.map(x => ETIQ_MODELO[x.modelo] || x.modelo), m.map(x => x.mape),
         m.map((x, i) => (i === 0 ? tema.serie[0] : tema.serie[5])), true);
  const q = D.mape_producto;
  barras('ch3', q.map(x => nombre(x.producto)), q.map(x => x.mape),
         q.map(x => (x.mape <= UMBRAL_BUENO ? tema.serie[0] : x.mape <= UMBRAL_MALO ? tema.serie[2] : tema.serie[1])));
};
