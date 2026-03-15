const db = require("../config/database");

exports.getKategori = (req, res) => {
  db.query("SELECT * FROM kategori", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.tambahKategori = (req, res) => {
  const { nama_kategori } = req.body;

  db.query("INSERT INTO kategori(nama_kategori) VALUES(?)", [nama_kategori], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Kategori berhasil ditambahkan",
    });
  });
};

exports.updateKategori = (req, res) => {
  const id = req.params.id;
  const { nama_kategori } = req.body;

  db.query("UPDATE kategori SET nama_kategori=? WHERE id=?", [nama_kategori, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Kategori berhasil diupdate",
    });
  });
};

exports.deleteKategori = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM kategori WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Kategori berhasil dihapus",
    });
  });
};
