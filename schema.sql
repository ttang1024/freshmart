-- E-commerce Database Schema for PostgreSQL

-- Create database (run separately)
-- CREATE DATABASE ecommerce_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id INTEGER REFERENCES categories (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(20) NOT NULL,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(500),
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (
        rating >= 0
        AND rating <= 5
    ),
    category_id INTEGER NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping',
    street_address VARCHAR(255) NOT NULL,
    suburb VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'New Zealand',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_address_id INTEGER REFERENCES addresses (id),
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    title VARCHAR(200),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items (user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);

-- Insert sample categories
INSERT INTO
    categories (name, slug, description)
VALUES (
        'Fruit & Veg',
        'fruit-veg',
        'Fresh fruits and vegetables'
    ),
    (
        'Meat & Seafood',
        'meat-seafood',
        'Quality meats and fresh seafood'
    ),
    (
        'Bakery',
        'bakery',
        'Fresh baked goods and bread'
    ),
    (
        'Dairy & Eggs',
        'dairy',
        'Dairy products, milk, cheese and eggs'
    ),
    (
        'Pantry',
        'pantry',
        'Pantry staples and dry goods'
    ),
    (
        'Beverages',
        'beverages',
        'Drinks, juices, and beverages'
    ),
    (
        'Frozen',
        'frozen',
        'Frozen foods and ice cream'
    ),
    (
        'Health & Beauty',
        'health-beauty',
        'Personal care and health products'
    ) ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO
    products (
        name,
        description,
        price,
        unit,
        stock,
        category_id,
        rating
    )
VALUES (
        'Fresh Bananas',
        'Sweet and ripe bananas',
        3.99,
        'kg',
        50,
        1,
        4.5
    ),
    (
        'Organic Tomatoes',
        'Locally grown organic tomatoes',
        5.99,
        'kg',
        30,
        1,
        4.7
    ),
    (
        'Avocados',
        'Creamy Hass avocados',
        2.99,
        'each',
        45,
        1,
        4.6
    ),
    (
        'Baby Spinach 120g',
        'Fresh baby spinach leaves',
        3.50,
        'pack',
        25,
        1,
        4.4
    ),
    (
        'Chicken Breast',
        'Fresh boneless chicken breast',
        12.99,
        'kg',
        25,
        2,
        4.6
    ),
    (
        'Fresh Salmon Fillet',
        'Atlantic salmon fillet',
        24.99,
        'kg',
        15,
        2,
        4.8
    ),
    (
        'Beef Mince',
        'Premium beef mince',
        14.99,
        'kg',
        20,
        2,
        4.5
    ),
    (
        'Sourdough Bread',
        'Artisan sourdough loaf',
        4.50,
        'each',
        20,
        3,
        4.9
    ),
    (
        'Croissants 6 Pack',
        'Butter croissants',
        6.99,
        'pack',
        18,
        3,
        4.4
    ),
    (
        'Blueberry Muffins 4pk',
        'Fresh baked muffins',
        5.99,
        'pack',
        15,
        3,
        4.3
    ),
    (
        'Full Cream Milk 2L',
        'Fresh full cream milk',
        3.80,
        'bottle',
        40,
        4,
        4.5
    ),
    (
        'Greek Yogurt 1kg',
        'Thick Greek style yogurt',
        7.99,
        'tub',
        22,
        4,
        4.6
    ),
    (
        'Cheddar Cheese 500g',
        'Tasty cheddar cheese',
        9.99,
        'block',
        30,
        4,
        4.7
    ),
    (
        'Pasta 500g',
        'Italian durum wheat pasta',
        2.50,
        'pack',
        60,
        5,
        4.3
    ),
    (
        'Olive Oil 1L',
        'Extra virgin olive oil',
        12.99,
        'bottle',
        35,
        5,
        4.7
    ),
    (
        'Basmati Rice 2kg',
        'Long grain basmati rice',
        8.99,
        'bag',
        28,
        5,
        4.5
    ) ON CONFLICT DO NOTHING;

-- Insert a sample user (password: 'password123')
INSERT INTO
    users (
        email,
        password_hash,
        first_name,
        last_name
    )
VALUES (
        'demo@example.com',
        'pbkdf2:sha256:260000$randomsalt$hashedpassword',
        'John',
        'Doe'
    ) ON CONFLICT (email) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();