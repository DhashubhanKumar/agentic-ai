# Agentic AI Customer Support System - Setup Guide

## Prerequisites

Before running the system, ensure you have:

1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher)
3. **Groq API Key** - Get free key from https://console.groq.com/

## Installation Steps

### 1. Install Frontend Dependencies

```bash
npm install
```

This will install:
- `socket.io-client` for real-time communication
- All existing Next.js dependencies

### 2. Set Up Python Backend

```bash
cd ai-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

#### Frontend (.env)
```env
NEXT_PUBLIC_AI_BACKEND_URL="http://localhost:8000"
GROQ_API_KEY="your_groq_api_key_here"
```

#### Backend (ai-backend/.env)
```env
GROQ_API_KEY="your_groq_api_key_here"
DATABASE_URL="file:../dev.db"
REDIS_URL=""  # Optional - leave empty for in-memory storage
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name add-ai-agent-models
```

This creates the new tables:
- `AgentSession` - Chat session tracking
- `Escalation` - Human handoff records
- `KnowledgeBase` - FAQ and product knowledge
- Updated `ChatMessage` - With AI metadata

### 5. Generate Prisma Client

```bash
npx prisma generate
```

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd ai-backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### Option 2: Run Concurrently (Recommended)

Install concurrently:
```bash
npm install -D concurrently
```

Add to package.json scripts:
```json
"ai-backend": "cd ai-backend && python main.py",
"dev:all": "concurrently \"npm run dev\" \"npm run ai-backend\""
```

Then run:
```bash
npm run dev:all
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Health**: http://localhost:8000/health

## Testing the Chat Widget

1. Open http://localhost:3000
2. Look for the purple chat button in the bottom-right corner
3. Click to open the chat window
4. Send a message like:
   - "Tell me about Rolex watches"
   - "What's the price of Patek Philippe Nautilus?"
   - "I'm frustrated with my order"

## Agent Workflow

The system uses 6 specialized agents:

1. **Interaction Agent** - Classifies user intent
2. **Knowledge Agent** - Retrieves product information
3. **Memory Agent** - Maintains conversation context
4. **Sentiment Agent** - Detects user frustration
5. **Decision Agent** - Determines response strategy
6. **Handoff Agent** - Escalates to human if needed

## Troubleshooting

### Backend won't start
- Check Groq API key is set correctly
- Ensure Python virtual environment is activated
- Verify all dependencies installed: `pip list`

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_AI_BACKEND_URL` in .env
- Check browser console for CORS errors

### Chat widget not appearing
- Clear browser cache and reload
- Check browser console for errors
- Verify `ChatWidget` is imported in `app/layout.tsx`

### Database errors
- Run `npx prisma migrate reset` to reset database
- Run `npx prisma migrate dev` to apply migrations
- Check `DATABASE_URL` in .env

## Optional: Redis Setup

For production, install Redis for persistent sessions:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

Then update `ai-backend/.env`:
```env
REDIS_URL="redis://localhost:6379"
```

## Monitoring

View backend logs in terminal to see:
- Agent decisions and routing
- Sentiment scores
- Confidence levels
- Escalation triggers

Example log output:
```
✓ Intent classified: product_inquiry
✓ Retrieved 3 products, score: 0.85
✓ Sentiment: 0.20, Signals: 0
✓ Decision: confidence=0.82, route=ai_response
```

## Next Steps

1. **Add Real Product Data**: Update `load_products_to_vector_store()` in `main.py` to fetch from Prisma
2. **Implement Human Dashboard**: Create admin interface for escalated chats
3. **Enhance Vector Store**: Integrate Pinecone or Chroma for better semantic search
4. **Add Analytics**: Track conversation metrics and agent performance
5. **Deploy**: Use Docker for containerization and deploy to cloud

## Support

For issues or questions:
1. Check backend logs for errors
2. Verify Groq API key is valid
3. Ensure all dependencies are installed
4. Check that ports 3000 and 8000 are available
