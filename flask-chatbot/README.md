# EU IVDR LLM Chatbot

AI-powered Flask chatbot for EU In Vitro Diagnostic Regulation compliance guidance.

## Features
- Real-time chat interface
- EU IVDR knowledge base covering:
  - Device classification
  - Conformity assessment procedures
  - Technical documentation requirements
  - Clinical evidence and performance evaluation
  - UDI registration
  - Vigilance reporting
  - Transition timelines
  - Notified body requirements
  - Quality management systems

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the app:
```bash
python app.py
```

3. Open browser to `http://localhost:5000`

## Deployment Options

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Railway
1. Connect your GitHub repo
2. Deploy from the `flask-chatbot` folder

### PythonAnywhere
1. Upload files to web app directory
2. Configure WSGI file to point to `app.py`
3. Set working directory to flask-chatbot folder

### Render
1. Create new Web Service
2. Point to this repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn app:app`

## Environment Variables
- `PORT`: Server port (default: 5000)

## Future Enhancements
- Integration with actual LLM (OpenAI, Anthropic, etc.)
- Document upload and analysis
- Multi-language support
- Session persistence
- Advanced regulatory document search
