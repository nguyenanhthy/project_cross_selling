# Lakehouse Demo — Hướng dẫn khởi động

## Cấu trúc thư mục
Project_cross_selling/
├── .git/
├── data/
├── delta_lake/
│   ├── _checkpoints/
│   ├── bronze/
│   ├── silver/
│   └── gold/
├── notebooks/
│   ├── 01_EDA.ipynb
│   ├── 02_bronze_layer.ipynb
│   ├── 03_silver_layer.ipynb
│   ├── 04_gold_layer.ipynb
│   ├── 05_mining.ipynb
│   └── 06_network_analysis.ipynb
├── demo/
├── docker-compose.yml
└── README.md

## Khởi động
1. Mở terminal và chuyển đến thư mục `Project_cross_selling`.
2. Chạy lệnh:

```bash
docker compose up
```

3. Mở trình duyệt và truy cập: **http://localhost:8888**

## Tắt
- Nhấn `Ctrl+C` trong terminal đang chạy container, hoặc:

```bash
docker compose down
```

## Lưu ý
- Các file CSV của Olist được lưu trong thư mục `data/`.
- Các notebook `.ipynb` nằm trong `notebooks/`.
- Delta Lake lưu dữ liệu trong `delta_lake/` và có thể được giữ lại giữa các lần chạy.
- Nếu máy yếu (RAM < 8GB), có thể giảm `mem_limit` trong `docker-compose.yml`.
- `delta_lake/` hiện có cấu trúc `bronze/`, `silver/` và `_checkpoints/` theo quá trình xử lý dữ liệu.