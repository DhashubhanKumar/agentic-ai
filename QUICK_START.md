# Quick Start Guide - AI Customer Support

## 🚀 Get Started in 3 Steps

### 1. Get Groq API Key (Free)
Visit: https://console.groq.com/
- Sign up for free account
- Copy your API key

### 2. Configure Environment

**Update `.env`**:
```env
GROQ_API_KEY="paste_your_key_here"
```

**Update `ai-backend/.env`**:
```env
GROQ_API_KEY="paste_your_key_here"
```

### 3. Set Up Backend

```bash
cd ai-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## ▶️ Run the System

**Terminal 1 - Frontend**:
```bash
npm run dev
```

**Terminal 2 - Backend**:
```bash
cd ai-backend
source venv/bin/activate
python main.py
```

## ✅ Verify It Works

1. Open http://localhost:3000
2. Look for purple chat button (bottom-right corner)
3. Click to open chat
4. Send: "Tell me about Rolex watches"
5. AI should respond with product information

## 🧪 Test Scenarios

**Product Inquiry**:
- "What watches do you have?"
- "Tell me about Patek Philippe"
- "How much is the Casio G-Shock?"

**Sentiment/Escalation**:
- "I'm very frustrated with my order!"
- "This is terrible service"
- (Should trigger escalation notice)

**General Chat**:
- "Hello!"
- "Thank you"

## 📊 What You'll See

### Backend Logs:
```
✓ Intent classified: product_inquiry
✓ Retrieved 3 products, score: 0.85
✓ Sentiment: 0.20, Signals: 0
✓ Decision: confidence=0.82, route=ai_response
```

### Frontend:
- Purple chat button with badge
- Glassmorphic chat window
- AI responses with typing indicator
- Escalation notice (when triggered)

## 🎯 Key Features

✅ 6 AI Agents working together
✅ Real-time WebSocket chat
✅ Sentiment analysis
✅ Automatic escalation
✅ Product knowledge search
✅ Context-aware responses

## 🔧 Troubleshooting

**Chat not appearing?**
- Check `app/layout.tsx` has `<ChatWidget />`
- Clear browser cache

**Backend won't start?**
- Verify Groq API key is set
- Check Python venv is activated
- Run `pip list` to verify packages

**Connection failed?**
- Backend must run on port 8000
- Frontend must run on port 3000
- Check firewall settings

## 📚 Full Documentation

See `AI_SETUP_GUIDE.md` for complete setup instructions.
See `walkthrough.md` for architecture details.

## 🎨 Chat Widget Location

The chat widget appears on **every page** because it's in `app/layout.tsx`.

Position: **Bottom-right corner** (fixed)
