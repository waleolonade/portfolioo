# Brainfeels Tech Portfolio & CMS

A high-performance, premium digital agency portfolio website for **Brainfeels Tech** featuring a dynamic, WordPress-like Content Management System (CMS) with Role-Based Access Control (RBAC).

---

## 🚀 Key Features

### 💻 Premium Frontend Showcase
- **Interactive Hero Section:** Dynamic particle canvas backdrop, animated terminal preview, and a typing script cycling through core specialties.
- **Dynamic Services Grid:** Deeply styled 8-card grid showing service offerings, benefits, features, and target pricing tiers.
- **Case Study Portfolio:** Fully detailed featured engagements with challenge, solution, and metric indicators.
- **Automated GitHub Showcase:** Dynamic integration fetching active repositories in real-time from GitHub's REST API.
- **Client Testimonials:** Sleek review cards showcasing verified feedback.
- **Interactive Lead Center:** Multi-form panel supporting Quick Message, briefed bookings, and a dynamic project cost calculator with estimation.

### ⚙️ Powerful Admin CMS
- **Dynamic Homepage Control:** Sort, restructure, rename, toggle visibility, and update titles/content across any and all homepage sections dynamically.
- **Role-Based Access Control (RBAC):**
  - **Super Admin (`admin` / `adminpassword`):** Full control over sections, settings, and users.
  - **Content Editor (`editor` / `editorpassword`):** Manage homepage copy, titles, and service offerings.
  - **Project Manager (`pm` / `pmpassword`):** CRUD operations on case study projects.
  - **Support Agent (`agent` / `agentpassword`):** Manage client inquiries and review qualified budget leads.
- **AI Generative Studio:** Leverage AI helpers to auto-generate case studies and structure projects based on title and category.
- **Lead Qualification Engine:** Inquiries are qualified automatically and rated with a lead score (0-100) based on budget, timeline, and content.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router, Vanilla CSS (Premium, Glassmorphism design tokens)
- **Backend:** PHP REST API (Modular architecture, CORS enabled, input cleaning, JWT/session authentication tokens)
- **Database:** MySQL / MariaDB (XAMPP environment)

---

## 📦 Installation & Setup

Follow these steps to get the application running locally in your development environment:

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js & npm:** [Download Node.js](https://nodejs.org/)
- **XAMPP (with PHP 8.1+ and MySQL):** [Download XAMPP](https://www.apachefriends.org/)
- **Git:** [Download Git](https://git-scm.com/)

---

### Step 1: Clone and Position the Repository
Ensure the project folder is placed directly inside your XAMPP `htdocs` directory (typically `C:\xampp\htdocs\` on Windows):

```bash
cd C:\xampp\htdocs\
git clone https://github.com/waleolonade/portfolioo.git
cd portfolioo
```

---

### Step 2: Set Up Database (MySQL)
1. Open the **XAMPP Control Panel** and start both **Apache** and **MySQL**.
2. No manual database creation or SQL importing is required! The PHP backend automatically detects if tables are missing and creates the `brainfeels_portfolio` database, seeds dummy content, and populates role-based accounts upon the first API request.
3. *Optional:* If you ever need to reset and re-seed the database schema to fresh defaults, open your browser and visit:
   `http://localhost:8000/api/db.php?migrate=true`

---

### Step 3: Run the Backend PHP Server
Open a terminal in the root of the project directory and start the PHP development server on port `8000` (required for dev-mode API communication):

```bash
php -S localhost:8000
```

*Note: In production mode, the API requests automatically fall back to routing through standard XAMPP Apache paths (`/portfolioo/api`).*

---

### Step 4: Run the Frontend React Server
Open a second terminal window in the root of the project directory, install the required node packages, and launch Vite's development server:

```bash
# Install node packages
npm install

# Start local React Vite dev server
npm run dev
```

Your browser should automatically open the project at `http://localhost:5173/`.

---

## 🔑 Default Accounts & Access Roles

To access the CMS dashboard, navigate to `http://localhost:5173/#/admin` (or `http://localhost:5173/#/admin/login`) and log in with one of the following pre-seeded developer credentials:

| Username | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- |
| **admin** | `adminpassword` | **Super Admin** | Full access bypass (CMS content, layout ordering, projects, inquiries, users) |
| **editor** | `editorpassword` | **Content Editor** | Modify titles, text, section structures, and services |
| **pm** | `pmpassword` | **Project Manager** | Case study editor, Project CRUD, and AI content assistant |
| **agent** | `agentpassword` | **Support Agent** | Check inquiries, lead score dashboard, and follow-ups |

---

## 🏗️ Building for Production

To bundle the optimized static frontend files for deployment under Apache:

```bash
npm run build
```

This will output static files into the `dist` directory. Move the build files to your public root subdirectory under Apache if deploying permanently.

---

*Developed for Brainfeels Tech portfolio operations.*
