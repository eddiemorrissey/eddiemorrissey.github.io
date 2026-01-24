# EU IVDR LLM on Raspberry Pi

This Flask app exposes `/chat` and `/health` endpoints that your website calls (see `_pages/euivdr-llm.html`). It uses Ollama to run a small, ARM-friendly local LLM on the Raspberry Pi.

## Prerequisites
- Raspberry Pi 4/5 with 64-bit OS (arm64).
- Python 3.10+.
- Ollama installed and running.

## Install Ollama (Pi)
```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable ollama
sudo systemctl start ollama
# Pull a small model suitable for Pi
# Preferred model for Pi
ollama pull phi3:mini
# Optional alternatives
# ollama pull qwen2.5:0.5b
# ollama pull llama3.2:1b
```

## Set up the Flask app
```bash
sudo apt update
sudo apt install -y python3-venv

# Copy the folder to the Pi and enter it
cd ~/pi-ivdr-app
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Run the server
```bash
export OLLAMA_HOST=http://localhost:11434
export OLLAMA_MODEL=phi3:mini
export PORT=5001
python app.py
```
The app listens on `0.0.0.0:5001`.

## Verify
```bash
curl http://<PI_IP>:5001/health
curl -X POST http://<PI_IP>:5001/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "Explain IVDR device classes"}'
```

Your website page `_pages/euivdr-llm.html` already calls `http://<PI_IP>:5001/chat` first. Update the IP in `_config.yml` (`ivdr_pi_base_url`). The site also passes `model` from `_config.yml` (`ivdr_model`) so you can switch models without editing code.

## Important: HTTPS pages cannot call HTTP Pi directly
GitHub Pages serves your site over HTTPS. Browsers block requests from HTTPS pages to `http://` private network URLs (mixed content + Private Network Access). To make the page reach your Pi:

- Option A (recommended): expose the Pi API via an HTTPS tunnel and set `ivdr_pi_base_url` to that URL.
  - Cloudflare Tunnel:
    ```bash
    # On the Pi
    curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
    sudo dpkg -i cloudflared.deb
    # Authenticate and create a tunnel mapped to localhost:5001
    cloudflared tunnel login
    cloudflared tunnel create ivdr
    cloudflared tunnel route dns ivdr <your-domain>  # or use trycloudflare for a temporary URL
    # Config: /etc/cloudflared/config.yml
    sudo tee /etc/cloudflared/config.yml <<'YML'
    tunnel: ivdr
    credentials-file: /root/.cloudflared/ivdr.json
    ingress:
      - hostname: ivdr.<your-domain>
        service: http://localhost:5001
      - service: http_status:404
    YML
    sudo systemctl enable cloudflared
    sudo systemctl start cloudflared
    ```
  - Set `ivdr_pi_base_url: "https://ivdr.<your-domain>"` in `_config.yml`.

- Option B: run the site locally (HTTP) for testing: `bundle exec jekyll serve` — then HTTP→HTTP works.

This repo’s Flask app now includes `Access-Control-Allow-Private-Network: true`, but browsers still block HTTPS→HTTP. Use HTTPS on the Pi endpoint for production.

## Optional: systemd service
Create `/etc/systemd/system/ivdr.service`:
```ini
[Unit]
Description=EU IVDR LLM Flask API
After=network.target ollama.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pi-ivdr-app
Environment=OLLAMA_HOST=http://localhost:11434
Environment=OLLAMA_MODEL=qwen2.5:0.5b
Environment=PORT=5001
ExecStart=/home/pi/pi-ivdr-app/.venv/bin/python /home/pi/pi-ivdr-app/app.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
Enable it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ivdr
sudo systemctl start ivdr
```
