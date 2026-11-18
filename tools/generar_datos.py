"""Convierte los CSV del proyecto SQL (data/fuente/) en data/datos.js, que consumen las gráficas.
Uso: python tools/generar_datos.py [carpeta_fuente]
Para usar otros resultados, reemplaza los CSV de data/fuente/ (mismas columnas) y vuelve a ejecutar."""
import csv, json, sys, collections
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "data" / "fuente"
TRAIN_FIN = 48      # meses de entrenamiento (igual que sql/00_esquema.sql)
HORIZONTE = 12      # meses a proyectar

def leer(nombre):
    with open(FUENTE / f"{nombre}.csv", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def ols_estacional(serie):
    """Réplica en Python de sql/regresion/01 y 02: tendencia OLS x índice estacional multiplicativo."""
    xs = range(1, TRAIN_FIN + 1)
    n = len(xs); sx = sum(xs); sy = sum(serie[t] for t in xs)
    sxx = sum(t * t for t in xs); sxy = sum(t * serie[t] for t in xs)
    b = (n * sxy - sx * sy) / (n * sxx - sx * sx); a = (sy - b * sx) / n
    s = {m: sum(serie[t] / (a + b * t) for t in xs if (t - 1) % 12 + 1 == m) / (n // 12) for m in range(1, 13)}
    total = len(serie) + HORIZONTE
    return [round((a + b * t) * s[(t - 1) % 12 + 1]) for t in range(1, total + 1)]

def main():
    ventas = collections.defaultdict(dict)
    for r in leer("ventas_mensuales"):
        ventas[r["producto"]][int(r["t"])] = float(r["unidades"])
    n_meses = max(len(v) for v in ventas.values())
    etiquetas = [f"{2021 + (t - 1) // 12}-{(t - 1) % 12 + 1:02d}" for t in range(1, n_meses + HORIZONTE + 1)]
    productos = {p: {"real": [int(d[t]) for t in sorted(d)], "estimado": ols_estacional(d)} for p, d in ventas.items()}

    cls = {(r["modelo"], r["particion"]): r for r in leer("metricas_clasificacion")}
    nb = cls[("naive_bayes", "test")]; base = cls[("base_clase_mayoritaria", "test")]
    f = float

    cargas = collections.defaultdict(dict); orden = []
    for r in leer("pca_cargas"):
        cargas[f"pc{r['pc']}"][r["variable"]] = f(r["carga"])
        if r["variable"] not in orden: orden.append(r["variable"])

    km = [{"k": int(r["k"]), "inercia": f(r["inercia"]), "silueta": f(r["silueta"])} for r in leer("km_resultados")]
    perfil = [{"cluster": int(r["cluster"]), "n": int(r["n"]), "z_nivel": f(r["z_nivel"]),
               "crec_mensual_pct": round(f(r["crec_mensual"]) * 100, 1),
               "tasa_alta_demanda_pct": round(f(r["tasa_alta_demanda"]) * 100, 1)} for r in leer("perfil_clusters")]
    ids = sorted(p["cluster"] for p in perfil)
    tri = collections.defaultdict(lambda: {i: 0 for i in ids})
    for r in leer("clusters_por_trimestre"):
        tri[int(r["trimestre"])][int(r["cluster"])] = int(r["n"])

    datos = {
        "etiquetas": etiquetas, "train_fin": TRAIN_FIN, "productos": productos,
        "modelos": [{"modelo": r["modelo"], "mape": f(r["mape_pct"])} for r in leer("metricas_regresion")],
        "mape_producto": [{"producto": r["producto"], "mape": f(r["mape_pct"])} for r in leer("metricas_regresion_producto")],
        "clasificacion": {"tp": int(nb["tp"]), "tn": int(nb["tn"]), "fp": int(nb["fp"]), "fn": int(nb["fn"]),
                          "exactitud": f(nb["exactitud"]), "precision": f(nb["precision"]), "recall": f(nb["recall"]),
                          "f1": f(nb["f1"]), "base_exactitud": f(base["exactitud"])},
        "pca": {"varianza": [{"pc": int(r["pc"]), "var": f(r["var_explicada"]) * 100, "acum": f(r["var_acumulada"]) * 100}
                             for r in leer("pca_varianza")],
                "variables": orden, "cargas": {k: [v[x] for x in orden] for k, v in cargas.items()}},
        "kmeans": {"k": km, "k_elegido": max(km, key=lambda x: x["silueta"])["k"], "perfil": perfil,
                   "clusters": ids, "trimestre": {str(q): [tri[q][i] for i in ids] for q in sorted(tri)}},
    }
    salida = RAIZ / "data" / "datos.js"
    salida.write_text("/* Generado por tools/generar_datos.py. No editar a mano. */\nwindow.DATOS = "
                      + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"OK -> {salida} ({salida.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
