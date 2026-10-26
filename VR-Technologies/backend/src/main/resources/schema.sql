-- VR Technologies E-Commerce Database Schema
CREATE DATABASE IF NOT EXISTS vr_technologies_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vr_technologies_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('CUSTOMER','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','SUPPORT') NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    timings VARCHAR(100),
    map_link TEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    model_number VARCHAR(100),
    brand VARCHAR(100),
    category VARCHAR(100),
    processor VARCHAR(100),
    processor_generation VARCHAR(50),
    ram_gb INT,
    storage_gb INT,
    storage_type VARCHAR(20),
    graphics VARCHAR(100),
    display_size VARCHAR(20),
    display_type VARCHAR(50),
    operating_system VARCHAR(100),
    `condition` ENUM('LIKE_NEW','EXCELLENT','GOOD','FAIR'),
    grade VARCHAR(10),
    battery_note VARCHAR(255),
    weight VARCHAR(30),
    selling_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percent INT,
    warranty_months INT DEFAULT 6,
    return_days INT DEFAULT 7,
    sku VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100),
    warranty_summary VARCHAR(255),
    description TEXT,
    visible_on_website BOOLEAN NOT NULL DEFAULT TRUE,
    featured_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_store_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_product_store (product_id, store_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    store_id BIGINT,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    store_id BIGINT,
    status ENUM('PLACED','CONFIRMED','PROCESSING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PLACED',
    type ENUM('HOME_DELIVERY','STORE_PICKUP') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    delivery_address TEXT,
    coupon_code VARCHAR(50),
    payment_method ENUM('COD','UPI','CARD','NET_BANKING','RAZORPAY'),
    payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('PERCENTAGE','FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    expiry_date DATE,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    image_url TEXT,
    link_url TEXT,
    position VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Sample Data: Stores
INSERT IGNORE INTO stores (id, name, address, city, state, phone, whatsapp, timings, latitude, longitude, active) VALUES
(1, 'VR Technologies – Ameerpet', 'S.No. 4-5-577, Ameerpet Main Road', 'Hyderabad', 'Telangana', '93981 23456', '9398123456', '10:00 AM – 9:00 PM', 17.4374, 78.4487, true),
(2, 'VR Technologies – KPHB',     'Shop No. 5, KPHB Phase 1, Kukatpally', 'Hyderabad', 'Telangana', '93981 23457', '9398123457', '10:00 AM – 9:30 PM', 17.4947, 78.3996, true),
(3, 'VR Technologies – Dilsukhnagar', 'No. 10-45-452, Dilsukhnagar', 'Hyderabad', 'Telangana', '93981 23458', '9398123458', '10:00 AM – 9:00 PM', 17.3688, 78.5247, true),
(4, 'VR Technologies – Guntur',  'Shop No. 5-131, Brodipet', 'Guntur', 'Andhra Pradesh', '93981 23459', '9398123459', '10:00 AM – 8:30 PM', 16.3067, 80.4365, true);

-- Sample Admin User (password: admin123)
INSERT IGNORE INTO users (name, email, password, role, active) VALUES
('Super Admin', 'admin@vr.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy.', 'SUPER_ADMIN', true);

-- Sample Products
INSERT IGNORE INTO products (name, model_number, brand, category, processor, processor_generation, ram_gb, storage_gb, storage_type, display_size, operating_system, `condition`, selling_price, original_price, discount_percent, warranty_months, return_days, sku, description, visible_on_website, featured_on_homepage, active) VALUES
('Lenovo ThinkPad T480', 'T480', 'Lenovo', 'Laptops', 'Intel Core i7', '8th Gen', 8, 256, 'SSD', '14"', 'Windows 10 Pro', 'EXCELLENT', 32999, 52999, 37, 6, 7, 'LEN-T480-001', 'Reliable business laptop with excellent performance.', true, true, true),
('HP EliteBook 840 G5',  '840 G5', 'HP', 'Laptops', 'Intel Core i5', '8th Gen', 8, 256, 'SSD', '14"', 'Windows 10 Pro', 'GOOD', 28999, 42999, 33, 6, 7, 'HP-840G5-002', 'Slim, premium business laptop with great build quality.', true, true, true),
('Dell Latitude 5490',   'E5490', 'Dell', 'Laptops', 'Intel Core i7', '8th Gen', 16, 512, 'SSD', '14"', 'Windows 10 Pro', 'EXCELLENT', 39999, 55999, 29, 6, 7, 'DEL-L5490-003', 'High performance laptop with 16GB RAM and 512GB SSD.', true, true, true),
('HP ProBook 450 G6',    '450 G6', 'HP', 'Laptops', 'Intel Core i5', '8th Gen', 8, 256, 'SSD', '15.6"', 'Windows 10 Pro', 'GOOD', 26999, 39999, 32, 6, 7, 'HP-PB450-004', 'Value-for-money business laptop.', true, false, true),
('Lenovo ThinkPad X1 Carbon', 'X1 Carbon', 'Lenovo', 'Laptops', 'Intel Core i5', '8th Gen', 8, 256, 'SSD', '14"', 'Windows 10 Pro', 'LIKE_NEW', 49999, 71999, 30, 6, 7, 'LEN-X1C-005', 'Ultra-light premium business laptop.', true, true, true);
