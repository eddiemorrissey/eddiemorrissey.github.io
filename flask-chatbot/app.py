from flask import Flask, render_template, request, jsonify
import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)

# Load Mistral-7B-Instruct model
print("Loading Mistral-7B-Instruct-v0.3 model...")
model_name = "mistralai/Mistral-7B-Instruct-v0.3"

# Check if CUDA is available
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        device_map="auto" if device == "cuda" else None,
        low_cpu_mem_usage=True
    )
    if device == "cpu":
        model = model.to(device)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    tokenizer = None

# Fallback knowledge base
IVDR_RESPONSES = {
    'classification': 'EU IVDR classifies IVDs into Classes A, B, C, and D based on risk. Class A has the lowest risk, while Class D includes devices for life-threatening diseases.',
    'conformity': 'Conformity assessment procedures vary by device class. Class D requires full quality assurance, while Class A may use self-declaration.',
    'technical documentation': 'Technical documentation must include device description, design and manufacturing information, risk management, clinical evidence, and labeling.',
    'clinical evidence': 'Clinical evidence requirements depend on device class. Higher-risk devices require more extensive clinical performance studies.',
    'performance evaluation': 'Performance evaluation must demonstrate scientific validity, analytical performance, and clinical performance of the IVD.',
    'udir': 'The EUDAMED database (UDI-R) requires registration of unique device identifiers for traceability.',
    'vigilance': 'Manufacturers must report serious incidents and field safety corrective actions to competent authorities.',
    'transition': 'The IVDR transition period ended May 26, 2022, though certain legacy devices have extended timelines.',
    'notified body': 'Most IVDs require notified body assessment. Only Class A devices (except sterile) can self-certify.',
    'qms': 'A quality management system compliant with ISO 13485 is required for all manufacturers.',
}

def get_fallback_response(message):
    """Simple pattern matching for IVDR queries"""
    message_lower = message.lower()
    
    for keyword, response in IVDR_RESPONSES.items():
        if keyword in message_lower:
            return response
    
    return "I can help with EU IVDR topics including classification, conformity assessment, technical documentation, clinical evidence, performance evaluation, UDI registration, vigilance, transition timelines, notified bodies, and QMS requirements. What would you like to know?"

def generate_response(user_message):
    """Generate response using Mistral model or fallback"""
    if model is None or tokenizer is None:
        return get_fallback_response(user_message)
    
    try:
        # Prepare the prompt with instruction format
        prompt = f"""<s>[INST] You are an expert EU IVDR (In Vitro Diagnostic Regulation) compliance assistant. Provide accurate, detailed answers about EU IVDR requirements, classifications, conformity assessment, technical documentation, clinical evidence, UDI registration, vigilance, and quality management systems. Keep responses concise but informative (2-3 paragraphs maximum).

User question: {user_message} [/INST]"""
        
        # Tokenize and generate
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=500,
                temperature=0.7,
                top_p=0.95,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant's response (after [/INST])
        if "[/INST]" in full_response:
            response = full_response.split("[/INST]")[-1].strip()
        else:
            response = full_response
        
        return response
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return get_fallback_response(user_message)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({'response': 'Please enter a message.'})
    
    bot_response = generate_response(user_message)
    
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
