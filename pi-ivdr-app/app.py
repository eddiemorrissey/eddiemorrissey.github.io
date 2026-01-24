from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Private Network Access: ensure preflight includes required header
@app.after_request
def add_pna_header(response):
    # Allow access from HTTPS page to private network if browser supports PNA
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    # Ensure CORS header present for fetch() from GitHub Pages
    if 'Access-Control-Allow-Origin' not in response.headers:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = response.headers.get('Access-Control-Allow-Headers', 'Content-Type')
    response.headers['Access-Control-Allow-Methods'] = response.headers.get('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

# Ollama configuration (runs locally on the Raspberry Pi)
BACKEND = os.environ.get('BACKEND', 'ollama').lower()  # 'ollama' or 'llamacpp'
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'phi3:mini')
LLAMACPP_HOST = os.environ.get('LLAMACPP_HOST', 'http://localhost:8080')

SYSTEM_PROMPT = (
    "You are an expert EU IVDR (In Vitro Diagnostic Regulation) compliance assistant. "
    "Provide accurate, practical guidance about IVDR requirements: device classification, "
    "conformity assessment, technical documentation, clinical evidence, UDI/EUDAMED, vigilance, "
    "transition timelines, notified bodies, and QMS (ISO 13485). Keep answers concise (1–2 paragraphs) "
    "and structured with bullet points where helpful. If unsure, say so and suggest verifying with "
    "the official IVDR text or competent authority guidance."
)

def ollama_generate(prompt: str, model_override: str | None = None) -> str:
    try:
        model = (model_override or OLLAMA_MODEL).strip() or OLLAMA_MODEL
        resp = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get('response', '').strip() or "(No response from model)"
    except Exception as e:
        print(f"Ollama error: {e}")
        return f"Error contacting local LLM: {e}"

def llama_cpp_generate(messages: list[dict]) -> str:
    try:
        resp = requests.post(
            f"{LLAMACPP_HOST}/v1/chat/completions",
            json={
                "messages": messages,
                "stream": False,
                "temperature": 0.7,
                "top_p": 0.95,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        # llama.cpp OpenAI-compatible response
        choices = data.get('choices', [])
        if choices:
            return choices[0].get('message', {}).get('content', '').strip() or "(No response from model)"
        return data.get('response', '').strip() or "(No response from model)"
    except Exception as e:
        print(f"llama.cpp error: {e}")
        return f"Error contacting llama.cpp: {e}"

def build_prompt(user_message: str) -> str:
    return (
        f"System: {SYSTEM_PROMPT}\n\n"
        f"User: {user_message}\n\n"
        f"Assistant:"
    )

@app.route('/health', methods=['GET'])
def health():
    if BACKEND == 'llamacpp':
        try:
            r = requests.get(f"{LLAMACPP_HOST}/v1/models", timeout=5)
            ok = r.status_code == 200
            models = r.json().get('data', []) if ok else []
        except Exception:
            ok = False
            models = []
        return jsonify({'status': 'healthy', 'backend': 'llamacpp', 'reachable': ok, 'models': models})
    else:
        # Check Ollama is reachable
        try:
            r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
            ok = r.status_code == 200
            tags = r.json().get('models', []) if ok else []
        except Exception:
            ok = False
            tags = []
        return jsonify({'status': 'healthy', 'backend': 'ollama', 'reachable': ok, 'model': OLLAMA_MODEL, 'available_models': tags})

@app.route('/chat', methods=['POST'])
def chat():
    payload = request.json or {}
    user_message = str(payload.get('message', '')).strip()
    model_req = str(payload.get('model', '')).strip() or None
    if not user_message:
        return jsonify({'response': 'Please enter a message.'})

    if BACKEND == 'llamacpp':
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ]
        response = llama_cpp_generate(messages)
        return jsonify({'response': response, 'backend': 'llamacpp'})
    else:
        prompt = build_prompt(user_message)
        response = ollama_generate(prompt, model_override=model_req)
        return jsonify({'response': response, 'backend': 'ollama', 'model': model_req or OLLAMA_MODEL})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
