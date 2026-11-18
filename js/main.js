/* Punto de entrada: dibuja todas las secciones con los datos de data/datos.js. */
(function () {
  if (!window.DATOS) { document.body.insertAdjacentHTML('afterbegin',
    '<p style="padding:20px">Falta data/datos.js. Ejecuta: python tools/generar_datos.py</p>'); return; }
  ['regresion', 'clasificacion', 'pca', 'kmeans'].forEach(s => Graficas[s](window.DATOS));
})();
