from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# EU IVDR knowledge base - basic responses
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

def get_ivdr_response(message):
    """Simple pattern matching for IVDR queries"""
    message_lower = message.lower()
    
    # Check for keywords in the message
    for keyword, response in IVDR_RESPONSES.items():
        if keyword in message_lower:
            return response
    
    # Default response
    return "I can help with EU IVDR topics including classification, conformity assessment, technical documentation, clinical evidence, performance evaluation, UDI registration, vigilance, transition timelines, notified bodies, and QMS requirements. What would you like to know?"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({'response': 'Please enter a message.'})
    
    bot_response = get_ivdr_response(user_message)
    
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
