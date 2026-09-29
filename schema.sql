-- Kaif Jamali Bikes - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/aspnzrvupuwtpvlzphnr/sql)

-- 1. Create Bikes Table
CREATE TABLE IF NOT EXISTS public.bikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC NOT NULL,
    image_url TEXT NOT NULL,
    top_speed VARCHAR(50),
    engine VARCHAR(100),
    power VARCHAR(100),
    stock VARCHAR(50) DEFAULT 'In Stock',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders / Inquiries Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    bike_id VARCHAR(255),
    bike_title VARCHAR(255) NOT NULL,
    bike_price NUMERIC NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) and set public policies
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to bikes
CREATE POLICY "Allow public read access to bikes" ON public.bikes FOR SELECT USING (true);
-- Allow public insert/update/delete access for admin management
CREATE POLICY "Allow all actions on bikes" ON public.bikes FOR ALL USING (true);

-- Allow public insert into orders
CREATE POLICY "Allow public insert into orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Allow public read/update/delete access for order management
CREATE POLICY "Allow all actions on orders" ON public.orders FOR ALL USING (true);

-- 4. Remove all items from bikes table
TRUNCATE TABLE public.bikes;
