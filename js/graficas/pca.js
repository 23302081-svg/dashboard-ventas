/* Sección 3: PCA. Varianza explicada (barras + acumulada) y cargas por componente. */
Graficas.pca = function (D) {
  const { tema, crear } = Graficas, p = D.pca;
  crear('ch5', { data: { labels: p.varianza.map(v => 'PC' + v.pc), datasets: [
    { type: 'bar', label: 'Individual', data: p.varianza.map(v => v.var), backgroundColor: tema.serie[3], borderRadius: 3 },
    { type: 'line', label: 'Acumulada', data: p.varianza.map(v => v.acum), borderColor: tema.serie[0],
      backgroundColor: tema.serie[0], borderWidth: 2.5 }] },
    options: { scales: { y: { max: 100, title: { display: true, text: '%' } } } } });

  crear('ch6', { type: 'bar', data: { labels: p.variables,
    datasets: Object.keys(p.cargas).map((k, i) => ({ label: k.toUpperCase(), data: p.cargas[k], backgroundColor: tema.serie[i] })) },
    options: { scales: { x: { ticks: { font: { size: 10 } } } } } });
};
