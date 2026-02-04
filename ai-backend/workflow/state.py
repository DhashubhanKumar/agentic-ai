"""LangGraph conversation state schema"""

from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime


class Message(TypedDict):
    """Individual message in conversation"""
    content: str
    sender: str  # 'user' or 'ai'
    timestamp: str
    metadata: Optional[Dict[str, Any]]


class ExtractedEntities(TypedDict):
    """Entities extracted from conversation"""
    watch_model: Optional[str]
    brand: Optional[str]
    price_range: Optional[tuple]
    order_id: Optional[str]
    category: Optional[str]


class ConversationState(TypedDict):
    """Complete conversation state for LangGraph"""
    
    # Core conversation data
    messages: List[Message]
    session_id: str
    user_id: Optional[str]
    
    # Context and memory
    conversation_summary: str
    user_intent: str
    extracted_entities: ExtractedEntities
    
    # Sentiment and friction
    sentiment_score: float  # -1 to 1
    escalation_signals: List[str]
    
    # Knowledge retrieval
    retrieved_products: List[Dict[str, Any]]
    retrieval_score: float
    
    # Decision making
    ai_confidence: float
    route: str  # 'ai_response', 'escalate', 'handoff'
    
    # Response generation
    ai_response: str
    agent_type: str  # Current agent handling the query
    
    # Consultation/Guided Discovery
    consultation_active: bool
    consultation_step: str
    collected_preferences: Dict[str, Any]
    
    # Generic Metadata
    metadata: Optional[Dict[str, Any]]
