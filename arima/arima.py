import sys
import requests
import pandas as pd
import numpy as np

from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==============================
# PARAMETER INPUT
# ==============================

produk_id = sys.argv[1] if len(sys.argv) > 1 else 1
periode = sys.argv[2] if len(sys.argv) > 2 else "7"

periode_map = {"3": 3, "7": 7, "30": 30}

steps = periode_map.get(periode, 7)


# ==============================
# AMBIL DATA DARI API
# ==============================

url = f"http://localhost:3001/api/prediksi/dataset/{produk_id}"

response = requests.get(url)
data = response.json()

df = pd.DataFrame(data)

if df.empty:
    print("Data kosong")
    exit()


# ==============================
# DATA PREPARATION
# ==============================

df["tanggal"] = pd.to_datetime(df["tanggal"]).dt.tz_localize(None)
df["total"] = pd.to_numeric(df["total"], errors="coerce")

df = df.set_index("tanggal")

# urutkan waktu
df = df.sort_index()

# resample harian
ts = df["total"].resample("D").sum()

# isi tanggal kosong
ts = ts.fillna(0)

print("\nDATASET TIME SERIES")
print(ts)


# ==============================
# SPLIT TRAIN TEST
# ==============================

train_size = int(len(ts) * 0.8)

train = ts[:train_size]
test = ts[train_size:]

print("\nTRAIN SIZE:", len(train))
print("TEST SIZE:", len(test))


# ==============================
# TRAIN MODEL ARIMA
# ==============================

model = ARIMA(train, order=(1, 1, 1))
model_fit = model.fit()


# ==============================
# PREDIKSI TEST DATA
# ==============================

forecast_test = model_fit.forecast(steps=len(test))


# ==============================
# EVALUASI MODEL
# ==============================

mae = mean_absolute_error(test, forecast_test)
mse = mean_squared_error(test, forecast_test)
rmse = np.sqrt(mse)

mape = np.mean(np.abs((test - forecast_test) / (test + 1))) * 100

r2 = r2_score(test, forecast_test)

akurasi = 100 - mape


print("\n===== EVALUASI MODEL =====")

print("MAE  :", mae)
print("MSE  :", mse)
print("RMSE :", rmse)
print("MAPE :", mape)
print("R2   :", r2)
print("AKURASI :", akurasi, "%")


# ==============================
# PREDIKSI MASA DEPAN
# ==============================

forecast_future = model_fit.forecast(steps=steps)

print(f"\n===== PREDIKSI {steps} HARI KE DEPAN =====")

print(forecast_future)


# ==============================
# OUTPUT JSON (UNTUK BACKEND)
# ==============================

result = {
    "evaluasi": {
        "mae": float(mae),
        "mse": float(mse),
        "rmse": float(rmse),
        "mape": float(mape),
        "r2": float(r2),
        "akurasi": float(akurasi),
    },
    "prediksi": forecast_future.tolist(),
}

print("\nRESULT_JSON")
print(result)
