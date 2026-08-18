# Emotion Pulse - Setup & Documentation

## 🎨 Design Philosophy

**Emotion Pulse** is built with intentional design choices that go beyond templates:

- **Color System**: Emotion-specific colors that represent each feeling's character (blue for sadness, amber for joy, pink for love, red for anger, purple for fear, cyan for surprise)
- **Typography**: Modern system fonts with clear hierarchy that feels premium and accessible
- **Layout**: Card-based design with smooth animations and micro-interactions that provide feedback without being distracting
- **Animations**: Purposeful motion that guides attention to results (slide, bounce, fill bar effects)
- **Responsive**: Seamless experience from mobile to desktop with appropriate scaling

The UI avoids generic patterns (cream backgrounds with terracotta accents, dark mode with acid green, newspaper layouts) and instead builds from the subject itself: emotions are intangible, so visualization and color carry the meaning.

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **TensorFlow**: Deep learning library (includes Keras)
- **Pydantic**: Data validation
- **NumPy**: Numerical computing

### Step 2: Verify Model Files

Ensure you have these files in your project:
```
Artifacts/
  ├── bigru_model_fixed.keras    # Pre-trained BiGRU model
  └── tokenizer.pkl              # Tokenizer for text preprocessing
```

If you don't have these files, train them first using your training script.

### Step 3: Create Static Files Directory

```bash
mkdir -p static
```

Then place these files in the `static` folder:
```
static/
  ├── index.html      # UI layout
  ├── style.css       # Styling
  └── script.js       # Interactivity
```

### Step 4: Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- `--reload`: Auto-restart on code changes (remove for production)
- `--host 0.0.0.0`: Access from any machine
- `--port 8000`: Run on port 8000

Open your browser: **http://localhost:8000**

---

## 📁 Project Structure

```
emotion-detection-api/
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── Artifacts/
│   ├── bigru_model_fixed.keras
│   └── tokenizer.pkl
└── static/
    ├── index.html            # HTML structure
    ├── style.css             # Styling & design system
    └── script.js             # Frontend logic
```

---

## 🔌 API Endpoints

### 1. **GET /** - Server UI
Returns the HTML interface.

```bash
curl http://localhost:8000/
```

### 2. **GET /health** - Health Check
Check if the model is loaded.

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "server is running",
  "model_loaded": true
}
```

### 3. **POST /predict** - Emotion Prediction
Analyze emotion in text.

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I am feeling amazing today!"}'
```

**Request:**
```json
{
  "text": "I am feeling amazing today!"
}
```

**Response:**
```json
{
  "text": "I am feeling amazing today!",
  "predicted_emotion": "joy",
  "confidence": 0.95,
  "all_probabilities": {
    "sadness": 0.01,
    "joy": 0.95,
    "love": 0.02,
    "anger": 0.01,
    "fear": 0.005,
    "surprise": 0.005
  }
}
```

---

## 🎯 Frontend Features

### Input Section
- **Text Area**: Enter up to 2000 characters
- **Character Counter**: Real-time character count
- **Submit Button**: Analyze emotion (Ctrl/Cmd + Enter to submit)
- **Loading State**: Animated loader while processing

### Results Display
- **Main Emotion**: Large emoji + name + confidence meter
- **Confidence Bar**: Visual representation of prediction confidence
- **Emotional Spectrum**: All 6 emotions with percentages and bars
- **Original Text**: Display of analyzed text in a highlighted section

### User Experience
- **Empty State**: Friendly prompt when page first loads
- **Smooth Animations**: Slide-in, fade, and bounce effects
- **Error Handling**: Clear error messages with validation feedback
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: Keyboard navigation, focus states, reduced motion support

---

## 🎨 Customization

### Change Colors
Edit the CSS variables in `style.css`:

```css
:root {
    --primary: #6366f1;              /* Main theme color */
    --sadness: #3b82f6;              /* Sadness emotion */
    --joy: #f59e0b;                  /* Joy emotion */
    --love: #ec4899;                 /* Love emotion */
    --anger: #ef4444;                /* Anger emotion */
    --fear: #8b5cf6;                 /* Fear emotion */
    --surprise: #06b6d4;             /* Surprise emotion */
}
```

### Change Fonts
Modify the font-family in `style.css`:

```css
body {
    font-family: 'Your Font Here', sans-serif;
}
```

### Adjust Spacing
All spacing is controlled by variables:

```css
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;
--spacing-xl: 3rem;
```

---

## 🛠️ Production Deployment

### Before Deploying:

1. **Remove `--reload` flag** from uvicorn
2. **Set `debug=False`** in FastAPI
3. **Use a production server** like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

4. **Add HTTPS** with a reverse proxy (nginx, Apache)
5. **Implement rate limiting** to prevent abuse
6. **Add proper logging** for monitoring
7. **Use environment variables** for configuration

### Deployment Options:

- **Heroku**: Push with Procfile
- **AWS EC2/Lambda**: Deploy FastAPI app
- **Google Cloud Run**: Containerized deployment
- **Railway/Render**: Simple git-based deployment
- **Docker**: Containerize for consistency

---

## 📊 Model Information

The backend uses a **BiGRU (Bidirectional GRU)** model for emotion detection:

- **Architecture**: Bidirectional Gated Recurrent Unit
- **Input**: Tokenized text sequences (max length: 50)
- **Output**: 6 emotion classes with probabilities
- **Preprocessing**: Lowercase, remove special characters, remove apostrophes, extra spaces

### Emotions Detected:
1. **Sadness** - 😭
2. **Joy** - 😁
3. **Love** - ❤️
4. **Anger** - 😠
5. **Fear** - 😨
6. **Surprise** - 😮

---

## 🐛 Troubleshooting

### Issue: Model not found
**Solution**: Verify paths in `main.py` and ensure files exist in `Artifacts/`

### Issue: Port 8000 already in use
**Solution**: Use a different port:
```bash
uvicorn main:app --port 8001
```

### Issue: CORS errors in frontend
**Solution**: CORS is already enabled in `main.py` with `allow_origins=["*"]`

### Issue: Slow predictions
**Solution**: 
- Model loads on startup (first request may be slow)
- Use GPU if available: `CUDA_VISIBLE_DEVICES=0`
- Consider model optimization or quantization

### Issue: 503 Model not loaded
**Solution**: Server is still loading. Wait a moment and try again.

---

## 📝 Requirements.txt Explained

```
fastapi==0.104.1              # Web framework
uvicorn[standard]==0.24.0     # ASGI server
python-multipart==0.0.6       # File upload support
pydantic==2.5.0               # Data validation
pydantic-settings==2.1.0      # Settings management
tensorflow==2.15.0            # Deep learning (includes Keras)
numpy==1.24.3                 # Numerical computing
python-dotenv==1.0.0          # Environment variables
```

---

## 🚦 Next Steps

1. **Train/Prepare Models**: Ensure you have trained BiGRU and tokenizer
2. **Install Dependencies**: Run `pip install -r requirements.txt`
3. **Start Server**: Run `uvicorn main:app --reload`
4. **Test Frontend**: Open http://localhost:8000
5. **Deploy**: Choose your hosting platform and deploy

---

## 📚 Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **TensorFlow/Keras**: https://www.tensorflow.org/
- **Deployment Guides**: Check your platform's documentation

---

**Built with ❤️ for emotion detection**