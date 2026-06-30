# Sanjaya Deployment Guide

This guide details how to build, containerize, and deploy the **Sanjaya Zero-Trust Privacy Engine** to production.

---

## 🏛️ System Architecture
Sanjaya is built as a split-stack application:
1. **Frontend**: React SPA built with Vite & Tailwind CSS. Serves the 3-panel review workspace, verification suite, and adversarial playground.
2. **Backend**: FastAPI (Python) web server. Handles document parsing (PDF, DOCX, TXT) and routes PII/adversarial audits through Google Gemini APIs (with local regex fallback).

For production, the recommended deployment is **Unified serving**: building the frontend React assets and serving them directly from the FastAPI backend as static assets. This eliminates CORS complexities and routes everything through a single port.

---

## 🔑 Environment Configuration
Before deploying, create your environment configuration (`.env` file) on your server:

```env
# Backend Environment
PORT=8000
HOST=0.0.0.0

# Google Gemini AI credentials (Optional - falls back to Local regex engine if empty)
GEMINI_API_KEY=AIzaSy...
```

---

## 🐋 Option A: Single Container Docker Deployment (Recommended)
This method compiles the Vite React assets and copies them into the FastAPI project directory, running both on a single unified port (`8000`).

### 1. Create a `Dockerfile` in the root directory:
```dockerfile
# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend & Serve ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies needed for document parsing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./

# Copy built frontend assets to FastAPI static folder
COPY --from=frontend-builder /app/frontend/dist /app/app/static

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Build and run the Docker image:
```bash
# Build the container
docker build -t sanjaya-app .

# Run the container locally
docker run -d -p 8000:8000 --env-file backend/.env sanjaya-app
```

---

## ☁️ Option B: Static + Web Service (Render / Railway / Vercel)
If you prefer not to use containers, you can split the build and deploy to free-tier cloud platforms.

### Part 1: FastAPI Backend (Deploy to Render or Railway)
1. **New Web Service**: Connect your GitHub repository to Render/Railway.
2. **Root Directory**: Select `backend`.
3. **Build Command**: `pip install -r requirements.txt`.
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. **Environment Variables**: Add `GEMINI_API_KEY` under settings.

### Part 2: React Frontend (Deploy to Vercel or Netlify)
1. **New Project**: Connect your GitHub repository to Vercel.
2. **Framework Preset**: Vite.
3. **Root Directory**: `frontend`.
4. **Build Command**: `npm run build`.
5. **Output Directory**: `dist`.
6. **Environment Variables**: If you are hosting the backend on a different domain, add `VITE_API_URL` pointing to your deployed backend URL.

---

## 🖥️ Option C: Manual Production Serving
To build and serve the application manually on an Ubuntu VM (e.g. AWS EC2, DigitalOcean):

### 1. Build the Frontend
```bash
cd frontend
npm install
npm run build
```
Copy the contents of `frontend/dist/` to the backend static assets directory, or configure an Nginx reverse proxy block to route static requests directly.

### 2. Set Up Nginx Reverse Proxy Config
Create `/etc/nginx/sites-available/sanjaya`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React Static Files
    location / {
        root /var/www/sanjaya/frontend/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Proxy API requests to FastAPI
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Run FastAPI in the background with systemd
Create a service file `/etc/systemd/system/sanjaya-backend.service`:
```ini
[Unit]
Description=Sanjaya FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/sanjaya/backend
Environment="PATH=/var/www/sanjaya/backend/venv/bin"
EnvironmentFile=/var/www/sanjaya/backend/.env
ExecStart=/var/www/sanjaya/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

[Install]
WantedBy=multi-user.target
```
Start and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start sanjaya-backend
sudo systemctl enable sanjaya-backend
sudo systemctl restart nginx
```
