/* Sección 2: clasificación. Matriz de confusión (HTML/CSS) y barras de métricas vs. línea base. */
Graficas.clasificacion = function (D) {
  const { tema, crear } = Graficas, c = D.clasificacion;
  const celda = (n, texto, color) =>
    `<div style="background:${color};color:#fff"><b style="font-size:24px">${n}</b><br>${texto}</div>`;
  document.getElementById('cm').innerHTML =
    '<span></span><div class="h">Predice baja</div><div class="h">Predice alta</div>' +
    `<div class="h">Real baja</div>${celda(c.tn, 'verdaderos neg.', tema.serie[0])}${celda(c.fp, 'falsa alarma', tema.serie[1])}` +
    `<div class="h">Real alta</div>${celda(c.fn, 'omitidos', tema.serie[1])}${celda(c.tp, 'verdaderos pos.', tema.serie[0])}`;

  crear('ch4', { type: 'bar', data: { labels: ['Exactitud', 'Precisión', 'Recall', 'F1'], datasets: [
    { label: 'Naive Bayes', data: [c.exactitud, c.precision, c.recall, c.f1], backgroundColor: tema.serie[0], borderRadius: 3 },
    { label: 'Clase mayoritaria', data: [c.base_exactitud, null, null, null], backgroundColor: tema.serie[5], borderRadius: 3 }] },
    options: { scales: { y: { min: 0, max: 1 } } } });
};
