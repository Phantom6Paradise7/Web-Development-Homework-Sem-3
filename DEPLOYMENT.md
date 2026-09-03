# 🚀 Render.com Deployment Guide for Shopease

This guide walks you through deploying your **Shopease Multi-Vendor E-Commerce Platform** on **Render.com** with a free cloud-hosted **MongoDB Atlas** database in less than 5 minutes.

---

## 📋 Overview of Deployment Architecture

```
                                      ┌─────────────────────────────────┐
                                      │         Render.com              │
                                      │   (Web Service - Node.js)       │
                                      │                                 │
[ Shoppers / Admin / Suppliers ] ───► │  ► Express Reverse Proxy Trust  │
            (HTTPS)                   │  ► EJS Server-Side Rendering    │
                                      │  ► Health Check (/health)       │
                                      └────────────────┬────────────────┘
                                                       │ (TLS Connection)
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │         MongoDB Atlas           │
                                      │  (Free M0 512MB Cloud Database) │
                                      │                                 │
                                      │  ► Categories, Products, Users  │
                                      │  ► Express Session Store        │
                                      └─────────────────────────────────┘
```

---

## Step 1: Set Up Free MongoDB Atlas Cloud Database

Because Render's free tier provides web application compute rather than a managed database, the industry standard is to connect a free **MongoDB Atlas** database cluster.

> [!NOTE]
> MongoDB Atlas M0 Free Tier is **100% free forever** (no credit card required), with 512 MB of storage—more than enough for thousands of products, users, and orders.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in or create an account.
2. In your MongoDB Atlas Dashboard:
   - Click **Create** or **Build a Database**.
   - Choose the **M0 Free** cluster (AWS or GCP, in any region closest to you).
   - Click **Create Deployment**.
3. **Set Up Database User Credentials**:
   - Go to **Security** -> **Database Access** in the left sidebar.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `shopease_admin` (or your preferred username).
   - Password: Click **Autogenerate Secure Password** (copy it!) or enter a secure password without special characters (e.g. `ShopeaseSecure2026`).
   - Database User Privileges: **Read and write to any database** (Atlas admin).
   - Click **Add User**.
4. **Allow Network Access (Crucial for Render)**:
   - Go to **Security** -> **Network Access** in the left sidebar.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm** (Render uses dynamic IP addresses, so `0.0.0.0/0` is required).
5. **Copy Connection String**:
   - Go to **Database** (or **Clusters**) in the left sidebar.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials you just created, and specify the database name `shopease_ecommerce` before the `?`:
     ```
     mongodb+srv://shopease_admin:ShopeaseSecure2026@cluster0.xxxxx.mongodb.net/shopease_ecommerce?retryWrites=true&w=majority
     ```

---

## Step 2: Push Code to GitHub

Ensure all recent production configurations and features are pushed to your GitHub repository:

```bash
cd /Users/mansabhatt/Desktop/My-Project

# Check current status
git status

# Stage all files
git add .

# Commit changes
git commit -m "Configure production deployment for Render.com with trust proxy and health check"

# Push to your GitHub main branch
git push origin main
```

---

## Step 3: Deploy on Render.com

You can deploy using either **Method A (Render Blueprint - Fastest)** or **Method B (Manual Dashboard)**:

### Method A: 1-Click Render Blueprint (Recommended)
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository: `Phantom6Paradise7/Web-Development-Homework-Sem-3`.
4. Render will automatically detect the [`render.yaml`](file:///Users/mansabhatt/Desktop/My-Project/render.yaml) file in your repository.
5. In the environment variable setup:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string from Step 1.
6. Click **Apply**.
7. Render will build and deploy your project automatically!

---

### Method B: Manual Web Service Setup
1. In your Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository: `Phantom6Paradise7/Web-Development-Homework-Sem-3`.
3. Configure the settings:
   - **Name**: `shopease-ecommerce` (or any unique name).
   - **Region**: Closest to your database (e.g. `Oregon (US West)` or `Frankfurt (EU)`).
   - **Branch**: `main`.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`.
4. Under **Environment Variables**, click **Add Environment Variable** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production caching & secure cookies |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `SESSION_SECRET` | `generate-random-secret` | Click **Generate** or type a random 32+ char string |
   | `PORT` | `10000` | Render default web port |
5. Under **Advanced**:
   - **Health Check Path**: `/health` (ensures zero-downtime deploys and status verification).
   - **Auto-Deploy**: `Yes`.
6. Click **Create Web Service**.

---

## Step 4: Populate Your Live Database (Seed Catalog & Accounts)

When your service finishes deploying, your MongoDB Atlas cluster will be empty. Populate it with the 8 categories, 16 rich products, and demo accounts:

### Option 1: Via Render Web Shell (Easiest)
1. In your Render Dashboard, go to your deployed web service.
2. In the left navigation, click **Shell**.
3. Once the terminal connects, run:
   ```bash
   npm run seed
   ```
4. You will see the confirmation output:
   ```
   [Seed] Connected to MongoDB: mongodb+srv://...
   [Seed] Inserted 8 categories.
   [Seed] Created Admin, Supplier, Customer accounts.
   [Seed] Inserted 16 rich products.
   [Seed Success] Database populated cleanly!
   ```

### Option 2: Pre-Seed from Your Local Computer
You can also run the seed script locally pointing to your Atlas database:
```bash
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shopease_ecommerce?retryWrites=true&w=majority" npm run seed
```

---

## Step 5: Test & Verify Your Live Deployment

Open your live Render URL (e.g. `https://shopease-ecommerce.onrender.com`):

1. **Verify Health Endpoint**:
   Visit `https://shopease-ecommerce.onrender.com/health` to confirm `{ "status": "ok" }`.
2. **Verify Homepage**:
   - 8 lifestyle department cards render with background imagery.
   - Live ticking Flash Deal countdown banner (`SAVE20`).
   - Spotlight item with **Quick View** button.
3. **Verify Demo Logins**:
   - Visit `/auth/login`.
   - Click **1-Click Demo Login as Merchant Admin** -> Redirects to Executive Dashboard (`/admin`).
   - Click **1-Click Demo Login as Supplier Partner** -> Redirects to Supplier Operations (`/supplier`).
4. **Verify Live Stock Controls**:
   - As an Admin or Supplier, test clicking `+5` or `-1` on any item in `/admin/products` or `/supplier/products` to verify instant live inventory updates.
5. **Verify Shopping Cart**:
   - Add items to cart and apply coupon `SAVE20` to verify the 20% discount.

---

## 💡 Important Tips for Render Free Tier

- **Spin-Down on Inactivity**: On the Render free tier, web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to wake up. Subsequent requests respond instantly.
- **HTTPS & SSL**: Render automatically generates and renews a free SSL certificate for your `onrender.com` subdomain and any custom domain.
- **Custom Domain**: In the Render dashboard under **Settings** -> **Custom Domains**, you can bind your own domain (e.g. `store.yourdomain.com`) with automated DNS verification.
