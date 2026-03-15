const db = require("../config/database");

exports.getProduk = (req, res) => {
  const query = `
  SELECT 
    produk.*,
    kategori.nama_kategori
  FROM produk
  LEFT JOIN kategori
  ON produk.kategori_id = kategori.id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.getProdukById = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM produk WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
};

exports.tambahProduk = (req, res) => {
  const { nama_produk, kategori_id, harga, stok, stok_minimum } = req.body;

  const query = `
  INSERT INTO produk
  (nama_produk,kategori_id,harga,stok,stok_minimum)
  VALUES (?,?,?,?,?)
  `;

  db.query(query, [nama_produk, kategori_id, harga, stok, stok_minimum], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Produk berhasil ditambahkan",
    });
  });
};

exports.updateProduk = (req, res) => {
  const id = req.params.id;

  const { nama_produk, kategori_id, harga, stok, stok_minimum } = req.body;

  const query = `
  UPDATE produk SET
  nama_produk=?,
  kategori_id=?,
  harga=?,
  stok=?,
  stok_minimum=?
  WHERE id=?
  `;

  db.query(query, [nama_produk, kategori_id, harga, stok, stok_minimum, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Produk berhasil diupdate",
    });
  });
};

exports.deleteProduk = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM produk WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Produk berhasil dihapus",
    });
  });
};
