# Raspberry Pi Hosting

This repo can auto-deploy your built Jekyll site to a Raspberry Pi on your network via GitHub Actions. You'll keep GitHub as the source of truth, and the Pi serves the static site.

## Prerequisites on the Pi
- Raspberry Pi OS (Debian-based) with SSH enabled.
- A non-root user for deployments (e.g., `deploy`).
- Nginx installed and running.

```bash
sudo apt update
sudo apt install nginx
sudo adduser deploy
sudo mkdir -p /var/www/eddiemorrissey
sudo chown -R deploy:www-data /var/www/eddiemorrissey
```

## Nginx configuration
Create a server block to serve the site from `/var/www/eddiemorrissey`.

```bash
sudo tee /etc/nginx/sites-available/eddiemorrissey <<'CONF'
server {
    listen 80;
    server_name _; # replace with your domain or Pi IP

    root /var/www/eddiemorrissey;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
CONF

sudo ln -s /etc/nginx/sites-available/eddiemorrissey /etc/nginx/sites-enabled/eddiemorrissey
sudo nginx -t && sudo systemctl reload nginx
```

For HTTPS, add a reverse proxy or install certbot; optional for local-only.

## SSH key for GitHub Actions
Generate a deploy key locally and add it to the Pi user's `authorized_keys`.

```bash
ssh-keygen -t ed25519 -C "github-actions-pi" -f ~/.ssh/pi_deploy_key
ssh deploy@<PI_HOST> 'mkdir -p ~/.ssh && chmod 700 ~/.ssh'
cat ~/.ssh/pi_deploy_key.pub | ssh deploy@<PI_HOST> 'cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

## GitHub Secrets
Add these repository secrets in GitHub → Settings → Secrets and variables → Actions:
- `PI_HOST`: Pi hostname or IP (e.g., `192.168.1.50`).
- `PI_USER`: `deploy`.
- `PI_PATH`: `/var/www/eddiemorrissey`.
- `PI_SSH_KEY`: contents of your private key (`~/.ssh/pi_deploy_key`).
- `PI_PORT`: `22` (optional).

## How it works
- On push to `main`, GitHub Actions builds the site to `_site/` and rsyncs it to the Pi path.
- Old files are deleted on the Pi to keep the directory in sync.

## Test deployment
After pushing to `main`, visit:
- `http://<PI_HOST>/` for IP-based access, or your configured domain.

If you use a custom domain, point DNS (A/AAAA records) to your Pi's public IP and configure port forwarding on your router (80/443) accordingly.
