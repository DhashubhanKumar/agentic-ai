"""FastAPI main application with Socket.IO for real-time AI chat"""

try:
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
except ImportError:
    print("\n❌ Error: FastAPI module not found.")
    print("------------------------------------------------------------")
    print("It looks like you haven't activated the virtual environment.")
    print("Please run the following command to start the backend:")
    print("\n    ./run_backend.sh")
    print("\nOr manually activate the venv:")
    print("    source venv/bin/activate && python3 main.py")
    print("------------------------------------------------------------\n")
    exit(1)
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import socketio
import asyncio
from datetime import datetime
import uuid

from config import settings
from workflow.graph import agent_workflow
from utils.session_manager import session_manager
from utils.vector_store import vector_store

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the application"""
    # Startup
    print("🚀 Starting AI Customer Support Backend...")
    
    # Initialize session manager
    await session_manager.initialize()
    
    # Load products into vector store (placeholder - would fetch from database)
    await load_products_to_vector_store()
    
    print("✓ Backend ready!")
    
    yield
    
    # Shutdown
    await session_manager.close()
    print("👋 Backend shutdown complete")

# Initialize FastAPI
app = FastAPI(
    title="AI Customer Support Backend",
    description="Agentic AI-powered customer support with 6 specialized agents",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True,
    allow_upgrades=True
)

# Wrap with Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, app)

# Active connections tracking
active_connections: Dict[str, WebSocket] = {}


async def load_products_to_vector_store():
    """Load product data into vector store"""
    # This would normally fetch from Prisma database
    # For now, using placeholder data
    sample_products = [
        {
            "id": "1",
            "name": "Rolex Submariner",
            "brand": "Rolex",
            "description": "Iconic dive watch with 300m water resistance, ceramic bezel, and automatic movement",
            "price": 12500,
            "category": "Luxury",
            "stock": 5
        },
        {
            "id": "2",
            "name": "Patek Philippe Nautilus",
            "brand": "Patek Philippe",
            "description": "Luxury sports watch with integrated bracelet, blue dial, and exceptional craftsmanship",
            "price": 35000,
            "category": "Luxury",
            "stock": 2
        },
        {
            "id": "3",
            "name": "Casio G-Shock",
            "brand": "Casio",
            "description": "Rugged digital watch with shock resistance, 200m water resistance, and multiple functions",
            "price": 150,
            "category": "Sport",
            "stock": 50
        }
    ]
    
    vector_store.load_from_products(sample_products)
    print(f"✓ Loaded {len(sample_products)} products into vector store")


# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "AI Customer Support",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "groq_configured": settings.groq_api_key != "your_groq_api_key_here",
        "redis_connected": session_manager.use_redis,
        "active_sessions": len(active_connections)
    }


@app.post("/api/sessions")
async def create_session(user_id: str = None):
    """Create a new chat session"""
    session_id = str(uuid.uuid4())
    session_data = await session_manager.create_session(session_id, user_id)
    
    return {
        "session_id": session_id,
        "created_at": session_data["created_at"]
    }


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session data"""
    session = await session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session


@app.get("/api/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    """Get chat messages for a session"""
    session = await session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": session.get("messages", [])
    }


# ============================================================================
# Socket.IO Event Handlers
# ============================================================================

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"✓ Client connected: {sid}")
    return True


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"✗ Client disconnected: {sid}")


@sio.event
async def join_session(sid, data):
    """Join a chat session"""
    session_id = data.get("session_id")
    user_id = data.get("user_id")
    
    # Create or retrieve session
    session = await session_manager.get_session(session_id)
    if not session:
        session = await session_manager.create_session(session_id, user_id)
    
    # Join Socket.IO room
    await sio.enter_room(sid, session_id)
    
    # Send session data
    await sio.emit("session_joined", {
        "session_id": session_id,
        "messages": session.get("messages", [])
    }, room=sid)
    
    print(f"✓ Client {sid} joined session {session_id}")


@sio.event
async def send_message(sid, data):
    """Handle incoming user message"""
    session_id = data.get("session_id")
    message = data.get("message", "").strip()
    user_id = data.get("user_id")
    
    # Get session for existing user_id if not provided
    session = await session_manager.get_session(session_id)
    if not user_id and session:
        user_id = session.get("user_id")
    
    if not message:
        return
    
    print(f"📨 Message from {sid}: {message[:50]}...")
    
    # Send typing indicator
    await sio.emit("typing", {"typing": True}, room=session_id)
    
    try:
        # Add user message to session
        user_message_data = {
            "content": message,
            "sender": "user",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": None
        }
        await session_manager.add_message(session_id, user_message_data)
        
        # Process through agent workflow
        response_data = await agent_workflow.process_message(
            session_id=session_id,
            user_message=message,
            user_id=user_id
        )
        
        # Add AI response to session
        ai_message_data = {
            "content": response_data["message"],
            "sender": "ai",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "agent_type": response_data["agent_type"],
                "confidence": response_data["confidence"],
                "intent": response_data["intent"]
            }
        }
        await session_manager.add_message(session_id, ai_message_data)
        
        # Update session metadata
        await session_manager.update_session(session_id, {
            "sentiment_score": response_data["sentiment"],
            "status": "escalated" if response_data["escalated"] else "active",
            "last_retrieved_products": response_data["metadata"].get("retrieved_products", []),
            "consultation_active": response_data["metadata"].get("consultation_active", False),
            "collected_preferences": response_data["metadata"].get("collected_preferences", {})
        })
        
        # Stop typing indicator
        await sio.emit("typing", {"typing": False}, room=session_id)
        
        # Send AI response
        await sio.emit("ai_message", {
            "message": response_data["message"],
            "payload": response_data.get("metadata", {}).get("retrieved_products", []), # Or generic payload field
            "timestamp": ai_message_data["timestamp"],
            "metadata": ai_message_data["metadata"]
        }, room=session_id)
        
        # Send escalation notice if needed
        if response_data["escalated"]:
            await sio.emit("escalation_notice", {
                "escalated": True,
                "handoff_data": response_data["metadata"].get("handoff_data")
            }, room=session_id)
        
        print(f"✓ Response sent (agent: {response_data['agent_type']}, confidence: {response_data['confidence']:.2f})")
        
    except Exception as e:
        print(f"✗ Error processing message: {e}")
        
        # Stop typing indicator
        await sio.emit("typing", {"typing": False}, room=session_id)
        
        # Send error message
        await sio.emit("ai_message", {
            "message": "I apologize, but I encountered an error. Please try again.",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {"error": True}
        }, room=session_id)


# ============================================================================
# Run Application
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:socket_app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
