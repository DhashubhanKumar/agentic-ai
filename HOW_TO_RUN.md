# How to Run Chronos Watch E-commerce Platform

This guide will help you start and run the application on your own.

## Prerequisites
- Node.js (v18+)
- Python 3.8+
- PostgreSQL database running

## Quick Start

### 1. Start the AI Backend (Port 8000)

Open a terminal and run:

```bash
cd ai-backend
source venv/bin/activate
python3 main.py
```

**What you'll see:**
```
🚀 Starting AI Customer Support Backend...
⚠ Redis not configured. Using in-memory storage.
✓ Loaded 3 products into vector store
✓ Backend ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The AI backend is now running at **http://localhost:8000**

---

### 2. Start the Next.js Frontend (Port 3000)

Open a **new terminal** (keep the backend running) and run:

```bash
cd /home/dhashu/Downloads/project1
npm run dev
```

**What you'll see:**
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://10.0.13.102:3000
✓ Ready in 568ms
```

The frontend is now running at **http://localhost:3000**

---

### 3. Access the Application

Open your browser and visit: **http://localhost:3000**

You should see the Chronos watch store with the AI chatbot in the bottom right corner!

---

## Stopping the Application

To stop either server, press `Ctrl+C` in the respective terminal.

---

## Troubleshooting

### Port Already in Use
If you see "Port 3000 is in use":
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Backend Issues
If the AI backend fails to start:
```bash
# Check if port 8000 is free
lsof -ti:8000 | xargs kill -9

# Reinstall dependencies if needed
cd ai-backend
pip install -r requirements.txt
```

### Database Connection Issues
Make sure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

---

## What Each Component Does

### AI Backend (Python/FastAPI)
- Handles natural language chat
- Processes user queries with 6 AI agents
- Extracts structured data from conversations
- NLP-to-SQL product search

### Frontend (Next.js)
- E-commerce UI
- Socket.IO chat integration
- Product catalog
- Cart & wishlist management

---

## Testing the AI Features

Try these queries in the chat:

1. **Search**: "Show me watches under 1000"
2. **Add to Cart**: "Add the Submariner Date to my cart"
3. **Add to Wishlist**: "Put the Daytona in my wishlist"
4. **Price Queries**: "I want luxury watches above 20000"
5. **Brand Queries**: "Show me all Rolex watches"

---

## Development Tips

- **Auto-reload**: Both servers auto-reload when you edit code
- **Backend logs**: Check the backend terminal for NLP extraction debug info
- **Frontend logs**: Use browser console for frontend debugging
- **Database**: Use `npx prisma studio` to view/edit database data

---

## Architecture

```
┌─────────────────┐
│   Browser       │
│  localhost:3000 │
└────────┬────────┘
         │
         │ HTTP/Socket.IO
         │
┌────────▼────────┐      ┌──────────────┐
│   Next.js       │◄────►│  PostgreSQL  │
│   Frontend      │      │   Database   │
└────────┬────────┘      └──────────────┘
         │
         │ Socket.IO
         │
┌────────▼────────┐      ┌──────────────┐
│   AI Backend    │◄────►│  Groq API    │
│  localhost:8000 │      │   (LLM)      │
└─────────────────┘      └──────────────┘
```

**Data Flow:**
1. User types in chat → Socket.IO → AI Backend
2. AI Backend extracts parameters → NLP-to-SQL
3. Backend calls Next.js API → PostgreSQL query
4. Results → AI formats response → User sees products

---

## Environment Variables

Make sure these are set in your `.env` files:

### Frontend `.env`
```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
BACKEND_SERVICE_KEY=your_service_key
```

### Backend `ai-backend/.env`
```
GROQ_API_KEY=your_groq_key
BACKEND_SERVICE_KEY=your_service_key
```

---

Happy coding! 🚀
