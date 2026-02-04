"""Session management with Redis fallback to in-memory storage"""

import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False


class SessionManager:
    """Manage chat sessions with Redis or in-memory fallback"""
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url
        self.redis_client = None
        self.in_memory_store: Dict[str, Dict[str, Any]] = {}
        self.use_redis = False
        
    async def initialize(self):
        """Initialize Redis connection if available"""
        if self.redis_url and REDIS_AVAILABLE:
            try:
                self.redis_client = await redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True
                )
                # Test connection
                await self.redis_client.ping()
                self.use_redis = True
                print("✓ Redis connected successfully")
            except Exception as e:
                print(f"⚠ Redis connection failed: {e}. Using in-memory storage.")
                self.use_redis = False
        else:
            print("⚠ Redis not configured. Using in-memory storage.")
            self.use_redis = False
    
    async def create_session(self, session_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session"""
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "messages": [],
            "conversation_summary": "",
            "sentiment_score": 0.0,
            "escalation_signals": [],
            "last_retrieved_products": [],
            "consultation_active": False,
            "collected_preferences": {},
            "refund_active": False,
            "refund_collected_info": {},
            "status": "active"
        }
        
        await self.set_session(session_id, session_data)
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve session data"""
        if self.use_redis and self.redis_client:
            try:
                data = await self.redis_client.get(f"session:{session_id}")
                return json.loads(data) if data else None
            except Exception as e:
                print(f"Redis get error: {e}")
                return None
        else:
            return self.in_memory_store.get(session_id)
    
    async def set_session(self, session_id: str, data: Dict[str, Any], expire_hours: int = 24):
        """Store session data"""
        if self.use_redis and self.redis_client:
            try:
                await self.redis_client.setex(
                    f"session:{session_id}",
                    timedelta(hours=expire_hours),
                    json.dumps(data)
                )
            except Exception as e:
                print(f"Redis set error: {e}")
                # Fallback to in-memory
                self.in_memory_store[session_id] = data
        else:
            self.in_memory_store[session_id] = data
    
    async def update_session(self, session_id: str, updates: Dict[str, Any]):
        """Update specific fields in session"""
        session = await self.get_session(session_id)
        if session:
            session.update(updates)
            await self.set_session(session_id, session)
    
    async def add_message(self, session_id: str, message: Dict[str, Any]):
        """Add a message to session history"""
        session = await self.get_session(session_id)
        if session:
            session["messages"].append(message)
            # Keep only last 20 messages to prevent memory bloat
            session["messages"] = session["messages"][-20:]
            await self.set_session(session_id, session)
    
    async def delete_session(self, session_id: str):
        """Delete a session"""
        if self.use_redis and self.redis_client:
            try:
                await self.redis_client.delete(f"session:{session_id}")
            except Exception as e:
                print(f"Redis delete error: {e}")
        else:
            self.in_memory_store.pop(session_id, None)
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()


# Global session manager instance
session_manager = SessionManager()
