const db = require("../config/database");
const { spawn } = require("child_process");

/*
========================
AMBIL DATASET
========================
*/
exports.getDataset = (req, res) => {
  const produk_id = req.params.produk_id;

  const query = `
SELECT 
DATE_FORMAT(DATE_ADD(tanggal, INTERVAL 7 HOUR), '%Y-%m-%d') as tanggal,
SUM(jumlah) as total
FROM transaksi
WHERE produk_id = ?
AND jenis_transaksi = 'keluar'
GROUP BY DATE_FORMAT(DATE_ADD(tanggal, INTERVAL 7 HOUR), '%Y-%m-%d')
ORDER BY tanggal
`;

  db.query(query, [produk_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

/*
========================
PREDIKSI ARIMA
========================
*/
exports.prediksi = (req, res) => {
  const produk_id = req.params.produk_id;
  const periode = req.query.periode || 7;

  const python = spawn("python", ["../../arima/arima.py", produk_id, periode]);

  let data = "";
  let error = "";

  python.stdout.on("data", (result) => {
    data += result.toString();
  });

  python.stderr.on("data", (err) => {
    error += err.toString();
  });

  python.on("close", () => {
    if (error) {
      return res.status(500).json({
        message: "Python Error",
        error: error,
      });
    }

    const jsonLine = data.split("RESULT_JSON")[1];

    try {
      const parsed = eval("(" + jsonLine.trim() + ")");
      res.json(parsed);
    } catch (e) {
      res.status(500).json({
        message: "Parsing Error",
        raw: data,
      });
    }
  });
};

/*
========================
GRAFIK PREDIKSI ARIMA
========================
*/

exports.chart = (req, res) => {
  const produk_id = req.params.produk_id;
  const periode = req.query.periode || 7;

  const datasetQuery = `
  SELECT 
  DATE_FORMAT(DATE_ADD(tanggal, INTERVAL 7 HOUR), '%Y-%m-%d') as tanggal,
  SUM(jumlah) as total
  FROM transaksi
  WHERE produk_id = ?
  AND jenis_transaksi = 'keluar'
  GROUP BY DATE_FORMAT(DATE_ADD(tanggal, INTERVAL 7 HOUR), '%Y-%m-%d')
  ORDER BY tanggal
  `;

  db.query(datasetQuery, [produk_id], (err, dataset) => {
    if (err) return res.status(500).json(err);

    const python = spawn("python", ["../arima/arima.py", produk_id, periode]);

    let data = "";
    let error = "";

    python.stdout.on("data", (result) => {
      data += result.toString();
    });

    python.stderr.on("data", (err) => {
      error += err.toString();
    });

    python.on("close", () => {
      if (error) {
        return res.status(500).json({
          message: "Python Error",
          error: error,
        });
      }

      try {
        const jsonLine = data.split("RESULT_JSON")[1];
        const parsed = eval("(" + jsonLine.trim() + ")");

        res.json({
          historical: dataset,
          forecast: parsed.prediksi,
          evaluasi: parsed.evaluasi,
        });
      } catch (e) {
        res.status(500).json({
          message: "Parsing Error",
          raw: data,
        });
      }
    });
  });
};
