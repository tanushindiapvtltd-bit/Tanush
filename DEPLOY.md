# Tanush — VPS Deployment Guide

Hostinger VPS + Docker Compose + Hostinger SSL certificate.

---

## Architecture

```
Internet → Nginx (80 → 443) → tanush_app (Next.js :3000) → tanush_db (Postgres :5432)
```

All containers share an internal Docker network. Only Nginx is exposed to the internet.

---

## Services in docker-compose.yml

| Service | Image | Role |
|---------|-------|------|
| `db` | postgres:16-alpine | PostgreSQL with persistent volume |
| `app` | built from Dockerfile | Next.js 16, auto-runs `prisma db push` on startup |
| `nginx` | nginx:1.27-alpine | Reverse proxy + SSL using Hostinger certs |

---

## Step 1 — Install Docker on the VPS

SSH into your Hostinger VPS as root:

```bash
ssh root@YOUR_VPS_IP
```

Install Docker:

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Open firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Verify
docker --version
docker compose version
```

---

## Step 2 — Point Domain to VPS

In **Hostinger DNS panel** (or wherever your domain DNS is managed):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_VPS_IP` |
| A | `www` | `YOUR_VPS_IP` |

Verify propagation before continuing:

```bash
dig +short yourdomain.com
# Must return YOUR_VPS_IP
```

---

## Step 3 — Download SSL Certificate from Hostinger

1. Log into **Hostinger hPanel**
2. Go to **Hosting → SSL** (or **Security → SSL**)
3. Find your domain's SSL certificate and click **Manage** or **Download**
4. Download the certificate — you need two files:
   - **Certificate** (`.crt` file, sometimes called "Certificate + CA chain" or "Full chain")
   - **Private Key** (`.key` file)

> If Hostinger gives you a bundle/chain certificate, use that as `certificate.crt`.
> The private key is shown once during setup — if you don't have it, re-issue the certificate.

---

## Step 4 — Clone Repo & Configure

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/tanush
cd /opt/tanush
```

**Replace the domain name in nginx.conf:**

```bash
sed -i 's/YOUR_DOMAIN/yourdomain.com/g' nginx/nginx.conf
```

**Create the SSL certs directory and upload your Hostinger cert files:**

```bash
mkdir -p /opt/tanush/nginx/certs
```

From your **local machine**, copy the cert files to the VPS:

```bash
scp certificate.crt root@YOUR_VPS_IP:/opt/tanush/nginx/certs/certificate.crt
scp private.key      root@YOUR_VPS_IP:/opt/tanush/nginx/certs/private.key
```

Secure the private key:

```bash
# On the VPS
chmod 600 /opt/tanush/nginx/certs/private.key
```

**Create the `.env` file:**

```bash
cp /opt/tanush/.env.example /opt/tanush/.env
nano /opt/tanush/.env
```

Generate secure values:

```bash
openssl rand -base64 24   # → use as POSTGRES_PASSWORD
openssl rand -base64 32   # → use as NEXTAUTH_SECRET
```

Fill in `.env`:

```env
POSTGRES_PASSWORD=<from above>
DATABASE_URL=postgresql://tanush:<POSTGRES_PASSWORD>@db:5432/tanush

NEXTAUTH_SECRET=<from above>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ... all other vars from .env.example
```

> `DATABASE_URL` must use hostname `db` (the Docker service name), not `localhost`.

---

## Step 5 — Start Everything

```bash
cd /opt/tanush
docker compose up --build -d
```

Watch the app start up:

```bash
docker compose logs -f app
# Wait for: "==> Starting Next.js application..."
```

Check all containers are running:

```bash
docker compose ps
```

Your app is live at `https://yourdomain.com`.

---

## Step 6 — Migrate Neon DB Data

**On your local machine** — dump from Neon:

```bash
pg_dump \
  --no-owner --no-acl --format=custom \
  --file=neon_backup.dump \
  "postgresql://USER:PASS@HOST/DATABASE?sslmode=require"
```

> macOS without pg_dump: `brew install postgresql@16`

**Transfer to VPS:**

```bash
scp neon_backup.dump root@YOUR_VPS_IP:/opt/tanush/
```

**On the VPS** — restore into the Docker container:

```bash
cd /opt/tanush

docker cp neon_backup.dump tanush_db:/tmp/neon_backup.dump

docker exec -it tanush_db pg_restore \
  --no-owner --no-acl --clean --if-exists \
  -U tanush -d tanush /tmp/neon_backup.dump

# Verify
docker exec tanush_db psql -U tanush -d tanush \
  -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products;"

# Cleanup
docker exec tanush_db rm /tmp/neon_backup.dump
rm /opt/tanush/neon_backup.dump
```

**Set admin role:**

```bash
docker exec -it tanush_db psql -U tanush -d tanush \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## Step 7 — Update Google OAuth

In **Google Cloud Console → APIs & Services → Credentials → Your OAuth Client**:

- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`

---

## Future Deploys

```bash
cd /opt/tanush
git pull origin main
docker compose up --build -d
```

---

## SSL Certificate Renewal

Hostinger SSL certificates typically auto-renew when purchased through Hostinger.
When Hostinger renews the cert, download the new files and replace them:

```bash
# Upload new cert files from local machine
scp certificate.crt root@YOUR_VPS_IP:/opt/tanush/nginx/certs/certificate.crt
scp private.key      root@YOUR_VPS_IP:/opt/tanush/nginx/certs/private.key
chmod 600 /opt/tanush/nginx/certs/private.key

# Reload nginx (no downtime)
docker compose exec nginx nginx -s reload
```

---

## Useful Commands

```bash
# View logs
docker compose logs -f
docker compose logs -f app

# Check container status
docker compose ps

# Restart app only (e.g. after .env change)
docker compose up -d app

# Open a postgres shell
docker exec -it tanush_db psql -U tanush -d tanush

# Backup database
docker exec tanush_db pg_dump -U tanush tanush \
  --no-owner --format=custom > ~/backup_$(date +%Y%m%d).dump

# Restore backup
docker cp ~/backup_20260315.dump tanush_db:/tmp/restore.dump
docker exec -it tanush_db pg_restore \
  --no-owner --no-acl --clean --if-exists \
  -U tanush -d tanush /tmp/restore.dump

# Free disk space
docker system prune -f
```

---

## Troubleshooting

**nginx won't start — SSL error**
```bash
docker compose logs nginx
```
- Check cert files exist: `ls -la /opt/tanush/nginx/certs/`
- File names must match nginx.conf: `certificate.crt` and `private.key`
- Wrong format? Hostinger sometimes gives `.pem` files — rename them:
  ```bash
  mv yourdomain.pem certificate.crt
  mv yourdomain.key private.key
  ```

**App container crashes**
```bash
docker compose logs app --tail=50
```
- Missing env var in `.env`?
- DB not ready? Check `docker compose logs db`

**502 Bad Gateway**
```bash
docker compose ps    # is app "Up"?
docker compose logs app
```

**Database connection error**
- `DATABASE_URL` must be `postgresql://tanush:PASSWORD@db:5432/tanush` — host is `db`, not `localhost`

---

## File Structure

```
tanush/
├── Dockerfile                 # Multi-stage Next.js build
├── .dockerignore
├── docker-compose.yml         # db + app + nginx
├── docker-entrypoint.sh       # prisma db push → node server.js
├── .env.example               # Template — copy to .env on VPS
├── nginx/
│   ├── nginx.conf             # Reverse proxy config with Hostinger SSL
│   └── certs/                 # Put certificate.crt + private.key here (VPS only)
└── next.config.ts             # output: "standalone" for Docker
```
