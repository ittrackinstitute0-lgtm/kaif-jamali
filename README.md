# 🏍️ Kaif Jamali Motors - Premium Bike Selling & Admin Portal

A luxury dark-themed bike dealership website built using **HTML5**, **CSS3**, **JavaScript (ES6+)**, and **Supabase Backend**.

---

## 🌟 Key Features

### 🛍️ Public Bike Dealership Frontend
- **Hero Section**: High-impact banner with brand identity, stats counters, and floating feature badges.
- **Dynamic Bike Fleet Catalog**: Search, filter by category (*Superbike, Sport, Cruiser, Electric, Adventure*), and sort by price or model name.
- **Detailed Specifications View**: Interactive modal displaying top speed, engine specs, max power output, stock status, and descriptions.
- **Customer Order & Booking Inquiry**: Instant booking modal saving order requests directly to Supabase and Local Storage.
- **Showroom Information & Direct Contact**: Interactive forms and contact details for Kaif Jamali Motors.

### 🛡️ Admin Panel Backend
- **Secure Admin Authentication**: Protected modal login (Default Password: `admin123` or `kaif123`).
- **Inventory Management (CRUD)**:
  - Add new bikes with image URLs, specs, category, and pricing.
  - Edit existing bike models and update specifications.
  - Delete bike listings from catalog.
- **Order & Customer Inquiry Management**:
  - Live table of all submitted customer order inquiries.
  - Update order status (*Pending, Confirmed, Delivered, Cancelled*) in real-time.
- **Supabase Integration & Database SQL Assistant**:
  - Connected to Supabase Project: `aspnzrvupuwtpvlzphnr.supabase.co`
  - Built-in SQL setup script with 1-click copy functionality.

---

## 🔑 Supabase API Credentials Connected

- **Supabase URL**: `https://aspnzrvupuwtpvlzphnr.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcG56cnZ1cHV3dHB2bHpwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjYxOTcsImV4cCI6MjEwNjI0MjE5N30.A4ssSSgwtCBWJmdpKpgHB6WkkARyuE_G51eiockpcOI`
- **Publishable Key**: `sb_publishable_kAEij-4sDWN4NsKNlo0C0g_I6blNys1`

---

## 🚀 How to Run locally

### Method 1: Python HTTP Server (Recommended)
Run the following command in the terminal inside this folder:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser.

### Method 2: Direct File Launch
Simply double click `index.html` to open it directly in any modern web browser.

---

## 🗄️ Setting Up Supabase Database Tables

To sync all bikes and customer orders with your live Supabase database:
1. Go to your [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/aspnzrvupuwtpvlzphnr/sql).
2. Open the file [`schema.sql`](file:///c:/Users/Admin/Desktop/king%20j%201/schema.sql) in this directory or click **Copy SQL** inside the Admin Panel -> Database tab.
3. Paste and run the SQL script to create the `bikes` and `orders` tables and insert sample seed data.

---

## 🔐 Admin Panel Credentials
- **Password**: `admin123`
