require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const produkRoutes = require("./routes/produkRoutes");
const transaksiRoutes = require("./routes/transaksiRoutes");
const prediksiRoutes = require("./routes/prediksiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/prediksi", prediksiRoutes);

app.get("/", (req, res) => {
  res.send("API Sistem Koperasi ARIMA");
});

app.listen(process.env.PORT, () => {
  console.log(`Server berjalan di port ${process.env.PORT}`);
});
