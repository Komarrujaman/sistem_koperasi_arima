const db = require("../config/database");

exports.getTransaksi = (req, res) => {
  const query = `
  SELECT 
    transaksi.*,
    produk.nama_produk
  FROM transaksi
  LEFT JOIN produk
  ON transaksi.produk_id = produk.id
  ORDER BY transaksi.tanggal DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.tambahTransaksi = (req, res) => {
  const { produk_id, jenis_transaksi, jumlah, harga, tanggal } = req.body;

  const total = jumlah * harga;

  // ambil stok produk dulu
  db.query("SELECT stok FROM produk WHERE id=?", [produk_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    let stok = result[0].stok;

    if (jenis_transaksi === "masuk") {
      stok = stok + jumlah;
    }

    if (jenis_transaksi === "keluar") {
      if (stok < jumlah) {
        return res.status(400).json({
          message: "Stok tidak mencukupi",
        });
      }

      stok = stok - jumlah;
    }

    // insert transaksi
    const queryTransaksi = `
      INSERT INTO transaksi
      (produk_id,jenis_transaksi,jumlah,harga,total,tanggal)
      VALUES (?,?,?,?,?,?)
      `;

    db.query(queryTransaksi, [produk_id, jenis_transaksi, jumlah, harga, total, tanggal], (err) => {
      if (err) return res.status(500).json(err);

      // update stok produk
      db.query("UPDATE produk SET stok=? WHERE id=?", [stok, produk_id], (err) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "Transaksi berhasil",
          stok_sekarang: stok,
        });
      });
    });
  });
};
