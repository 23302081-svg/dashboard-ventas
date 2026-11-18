/* Sección 4: k-means. Selección de k, tasa de alta demanda, grupos por trimestre y tabla de perfiles. */
Graficas.kmeans = function (D) {
  const { tema, crear, barras } = Graficas, km = D.kmeans;
  /* Lectura de negocio de cada grupo: es interpretación del analista, edítala si cambian los datos. */
  const LECTURA = { 1: 'Caída de fin de temporada', 2: 'Nivel bajo y estable', 3: 'Arranque de temporada',
                    4: 'Nivel alto en ascenso', 5: 'Meseta alta, ligera baja', 6: 'Picos de demanda' };

  crear('ch7', { data: { labels: km.k.map(x => 'k=' + x.k), datasets: [
    { type: 'bar', label: 'Silueta', data: km.k.map(x => x.silueta), yAxisID: 'y', borderRadius: 3,
      backgroundColor: km.k.map(x => (x.k === km.k_elegido ? tema.serie[1] : tema.serie[5])) },
    { type: 'line', label: 'Inercia', data: km.k.map(x => x.inercia), yAxisID: 'y1',
      borderColor: tema.serie[3], backgroundColor: tema.serie[3] }] },
    options: { scales: { y: { min: 0.25, max: 0.4, title: { display: true, text: 'silueta' } },
                         y1: { position: 'right', grid: { display: false }, title: { display: true, text: 'inercia' } } } } });

  const P = km.perfil;
  barras('ch8', P.map(r => `G${r.cluster} (n=${r.n})`), P.map(r => r.tasa_alta_demanda_pct),
         P.map(r => (r.tasa_alta_demanda_pct >= 90 ? tema.serie[0] : r.tasa_alta_demanda_pct <= 15 ? tema.serie[1] : tema.serie[2])));

  crear('ch9', { type: 'bar', data: { labels: Object.keys(km.trimestre).map(q => 'T' + q),
    datasets: km.clusters.map((g, i) => ({ label: 'G' + g, backgroundColor: tema.serie[i % 6],
      data: Object.keys(km.trimestre).map(q => km.trimestre[q][i]) })) },
    options: { scales: { x: { stacked: true }, y: { stacked: true } } } });

  document.getElementById('tb').innerHTML =
    '<tr><th>G</th><th>n</th><th>Nivel (z)</th><th>Crec. %</th><th>Lectura</th></tr>' +
    P.map(r => `<tr><td>${r.cluster}</td><td>${r.n}</td><td>${r.z_nivel}</td><td>${r.crec_mensual_pct}</td><td>${LECTURA[r.cluster] || ''}</td></tr>`).join('');
};
