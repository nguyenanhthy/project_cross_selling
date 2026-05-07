# Lakehouse Demo — Hướng dẫn khởi động

## Cấu trúc thư mục
Project_cross_selling/
├── `.git/`
├── `data/`
│   ├── `olist_customers_dataset.csv`
│   ├── `olist_geolocation_dataset.csv`
│   ├── `olist_order_items_dataset.csv`
│   ├── `olist_order_payments_dataset.csv`
│   ├── `olist_order_reviews_dataset.csv`
│   ├── `olist_orders_dataset.csv`
│   ├── `olist_products_dataset.csv`
│   ├── `olist_sellers_dataset.csv`
│   └── `product_category_name_translation.csv`
├── `delta_lake/`
│   ├── `_checkpoints/`
│   │   ├── `customers/`
│   │   ├── `order_items/`
│   │   ├── `orders/`
│   │   ├── `products/`
│   │   └── `translations/`
│   ├── `bronze/`
│   │   ├── `customers/`
│   │   ├── `order_items/`
│   │   ├── `orders/`
│   │   ├── `products/`
│   │   └── `translations/`
│   └── `silver/`
│       ├── `customers/`
│       ├── `order_items/`
│       ├── `orders/`
│       └── `products/`
├── `notebooks/`
│   ├── `01_EDA.ipynb`
│   ├── `02_bronze_layer.ipynb`
│   ├── `03_silver_layer.ipynb`
│   ├── `04_gold_layer.ipynb`
│   └── `Nháp.ipynb`
├── `docker-compose.yml`
├── `olist_customers_dataset_part2.csv`
└── `README.md`

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