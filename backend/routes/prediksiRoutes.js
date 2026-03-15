const express = require("express");
const router = express.Router();

const prediksiController = require("../controllers/prediksiController");

router.get("/dataset/:produk_id", prediksiController.getDataset);

router.get("/chart/:produk_id", prediksiController.chart);

router.get("/:produk_id", prediksiController.prediksi);

module.exports = router;
