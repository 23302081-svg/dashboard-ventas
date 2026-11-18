# Dashboard de ventas con Chart.js

Código fuente de las gráficas del dashboard del caso práctico *Pronóstico de ventas con SQL*
(regresión, clasificación, PCA y k-means). Biblioteca de gráficas: **[Chart.js 4.4.1](https://www.chartjs.org/)**,
sin framework ni paso de compilación.

## Estructura

```
dashboard-ventas-chartjs/
├── index.html                  # maquetación, textos de interpretación y orden de carga
├── css/estilos.css             # estilos y paleta (variables CSS, modo claro/oscuro)
├── data/
│   ├── fuente/*.csv            # resultados del repositorio ventas-sql-ml (entrada)
│   └── datos.js                # GENERADO: window.DATOS con todo lo que dibujan las gráficas
├── tools/generar_datos.py      # CSV -> data/datos.js (incluye el ajuste OLS x estacionalidad)
└── js/
    ├── tema.js                 # colores desde CSS, valores por defecto de Chart.js, helpers crear() y barras()
    ├── graficas/
    │   ├── regresion.js        # ch1 línea real/ajuste/prueba/proyección + selector, ch2 y ch3 MAPE
    │   ├── clasificacion.js    # matriz de confusión (HTML/CSS) y ch4 métricas
    │   ├── pca.js              # ch5 varianza explicada, ch6 cargas
    │   └── kmeans.js           # ch7 silueta/inercia, ch8 alta demanda, ch9 trimestres, tabla de perfiles
    └── main.js                 # ejecuta cada sección con window.DATOS
```

## Uso

```bash
python tools/generar_datos.py     # regenera data/datos.js desde data/fuente/*.csv (solo biblioteca estándar)
# abre index.html en el navegador (doble clic) o sirve la carpeta:
python -m http.server 8000        # http://localhost:8000
```

Requiere conexión para cargar Chart.js desde cdnjs. Para uso sin internet: `npm i chart.js@4.4.1` y cambia el
`<script>` de `index.html` por `node_modules/chart.js/dist/chart.umd.js`.

## Con tus propios resultados

1. Ejecuta el pipeline SQL (`ventas-sql-ml/run_all.py`).
2. Copia a `data/fuente/` los CSV de `results/` y `data/ventas_mensuales.csv` con las mismas columnas
   (los nombres de archivo usados están en `tools/generar_datos.py`).
3. `python tools/generar_datos.py` y recarga la página.

El script usa `TRAIN_FIN = 48` y `HORIZONTE = 12`; ajústalos si cambia la partición del esquema SQL.

## Cómo añadir una gráfica

1. Agrega un `<canvas id="chN">` en `index.html`.
2. Agrega los datos necesarios en `generar_datos.py` (el diccionario `datos`).
3. Crea la función en el módulo de la sección con `Graficas.crear('chN', {...})` o `Graficas.barras(...)`.
4. Los colores salen de `Graficas.tema.serie[0..5]`, no uses colores fijos para que funcione el modo oscuro.

## Qué es dato y qué es texto fijo

- **Se lee de los CSV:** todas las series, métricas, matrices y perfiles.
- **Está escrito a mano:** los textos de interpretación y los indicadores (KPI) de `index.html`, y las etiquetas de lectura de
  cada grupo en `kmeans.js` (`LECTURA`). Si cambias los datos, revísalos.
- El ajuste del pronóstico se recalcula en Python con la misma fórmula del SQL (`sql/regresion/01` y `02`); las métricas
  (MAPE, etc.) vienen del SQL.

## Licencia de terceros

Chart.js se distribuye bajo licencia MIT.
