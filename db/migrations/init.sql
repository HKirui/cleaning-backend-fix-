-- ================================
-- CLEANING PLATFORM DATABASE SCHEMA
-- ================================

-- Drop tables if they exist (for fresh rebuilds)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'cleaner', 'admin')),
    password TEXT NOT NULL,
    subscribed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);


-- ================================
-- SUBSCRIPTIONS TABLE
-- ================================
CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    proof_image TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);


-- ================================
-- SERVICES TABLE
-- ================================
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    cleaner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    service_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    base_price INTEGER NOT NULL,
    duration_hours INTEGER DEFAULT 1,
    service_area VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);


-- ================================
-- BOOKINGS TABLE
-- ================================
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    cleaner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


-- ================================
-- PAYMENTS TABLE (LOGGING)
-- ================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    mpesa_receipt TEXT,
    phone_number VARCHAR(20),
    raw_callback JSONB,
    status VARCHAR(20) DEFAULT 'success',
    created_at TIMESTAMP DEFAULT NOW()
);


-- ================================
-- ADMIN ACCOUNT (OPTIONAL)
-- ================================
INSERT INTO users (first_name, last_name, email, phone, user_type, password, subscribed)
VALUES (
    'Admin',
    'Main',
    'admin@cleaning.com',
    '0700000000',
    'admin',
    '$2a$10$RAnKj0uAqAcYQFq6u8KeXOYB9HCT1kpC5u7JL/5nJyozkcqBLBW1e', -- password = "admin123"
    true
);
