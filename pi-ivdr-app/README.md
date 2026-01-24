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
ollama pull qwen2.5:0.5b
# Optional alternative
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
export OLLAMA_MODEL=qwen2.5:0.5b
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

Your website page `_pages/euivdr-llm.html` already calls `http://<PI_IP>:5001/chat` first. Update the IP if needed.

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
