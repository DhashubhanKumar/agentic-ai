"""LangGraph workflow orchestration - Agent collaboration state machine"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from workflow.state import ConversationState
from agents.interaction_agent import create_interaction_agent
from agents.knowledge_agent import create_knowledge_agent
from agents.memory_agent import create_memory_agent
from agents.sentiment_agent import create_sentiment_agent
from agents.decision_agent import create_decision_agent
from agents.handoff_agent import create_handoff_agent
from agents.consultant_agent import create_consultant_agent
from config import settings


class AgentWorkflow:
    """LangGraph workflow for multi-agent collaboration"""
    
    def __init__(self):
        # Initialize Groq LLMs
        self.primary_llm = ChatGroq(
            model=settings.primary_model,
            temperature=settings.model_temperature,
            groq_api_key=settings.groq_api_key
        )
        
        self.fallback_llm = ChatGroq(
            model=settings.fallback_model,
            temperature=0.2,
            groq_api_key=settings.groq_api_key
        )
        
        # Initialize agents
        self.interaction_agent = create_interaction_agent(self.fallback_llm)
        self.knowledge_agent = create_knowledge_agent(self.primary_llm)
        self.memory_agent = create_memory_agent(self.fallback_llm)
        self.sentiment_agent = create_sentiment_agent(self.fallback_llm)
        self.decision_agent = create_decision_agent(
            self.primary_llm,
            settings.ai_confidence_threshold
        )

        self.handoff_agent = create_handoff_agent(self.primary_llm)
        self.consultant_agent = create_consultant_agent(self.primary_llm)
        
        # Build workflow graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state machine"""
        
        # Create state graph
        workflow = StateGraph(ConversationState)
        
        # Add agent nodes
        workflow.add_node("interaction", self._interaction_node)
        workflow.add_node("memory", self._memory_node)
        workflow.add_node("knowledge", self._knowledge_node)
        workflow.add_node("sentiment", self._sentiment_node)
        workflow.add_node("decision", self._decision_node)
        workflow.add_node("handoff", self._handoff_node)
        workflow.add_node("consultant", self._consultant_node)
        
        # Set entry point
        workflow.set_entry_point("interaction")
        
        # Define sequential flow
        workflow.add_edge("interaction", "memory")
        # workflow.add_edge("memory", "knowledge") # Replaced by conditional edge
        
        # Conditional routing after memory (to Consultation or Knowledge)
        workflow.add_conditional_edges(
            "memory",
             self._route_memory,
             {
                 "consultation": "consultant",
                 "escalation": "handoff",
                 "standard": "knowledge"
             }
        )
        
        # Conditional routing from consultant
        workflow.add_conditional_edges(
            "consultant",
             self._route_consultant,
             {
                 "search_products": "knowledge",
                 "continue_consultation": END
             }
        )
        
        workflow.add_edge("knowledge", "sentiment")
        workflow.add_edge("sentiment", "decision")
        
        # Conditional routing from decision node
        workflow.add_conditional_edges(
            "decision",
            self._route_decision,
            {
                "ai_response": END,
                "ai_response_with_offer": END,
                "escalate": "handoff",
                "consultation": "consultant"
            }
        )
        
        # Handoff leads to end
        workflow.add_edge("handoff", END)
        
        # Compile graph
        return workflow.compile()
    
    # Agent node wrappers
    async def _interaction_node(self, state: ConversationState) -> ConversationState:
        """Website Interaction Agent node"""
        return await self.interaction_agent.process(state)
    
    async def _memory_node(self, state: ConversationState) -> ConversationState:
        """Context & Memory Agent node"""
        return await self.memory_agent.process(state)
    
    async def _knowledge_node(self, state: ConversationState) -> ConversationState:
        """Knowledge & Retrieval Agent node"""
        return await self.knowledge_agent.process(state)
    
    async def _sentiment_node(self, state: ConversationState) -> ConversationState:
        """Sentiment Detection Agent node"""
        return await self.sentiment_agent.process(state)
    
    async def _decision_node(self, state: ConversationState) -> ConversationState:
        """Decision-Making Agent node"""
        return await self.decision_agent.process(state)
    
    async def _handoff_node(self, state: ConversationState) -> ConversationState:
        """Human Handoff Agent node"""
        return await self.handoff_agent.process(state)
        
    async def _consultant_node(self, state: ConversationState) -> ConversationState:
        """Consultant Agent node"""
        return await self.consultant_agent.process(state)
    
    def _route_decision(
        self,
        state: ConversationState
    ) -> Literal["ai_response", "ai_response_with_offer", "escalate", "consultation"]:
        """Route based on decision agent output"""
        route = state.get("route", "ai_response")
        
        if route == "escalate":
            return "escalate"
        elif route == "consultation":
            return "consultation"
        elif route == "ai_response_with_offer":
            # Append offer to AI response
            current_response = state.get("ai_response", "")
            state["ai_response"] = (
                f"{current_response}\n\n"
                "If you'd like to speak with a human agent, just let me know!"
            )
            return "ai_response_with_offer"
        else:
            return "ai_response"
            
    def _route_memory(self, state: ConversationState) -> Literal["consultation", "escalation", "standard"]:
        """Route based on intent or active consultation"""
        intent = state.get("user_intent", "")
        is_active = state.get("consultation_active", False)
        
        if intent == "human_handoff":
            return "escalation"
        elif intent == "consultation" or is_active:
            return "consultation"
        return "standard"

    def _route_consultant(self, state: ConversationState) -> Literal["search_products", "continue_consultation"]:
        """Route from consultant (search or reply)"""
        route = state.get("route", "")
        if route == "search":
            return "search_products"
        return "continue_consultation"
    
    async def process_message(
        self,
        session_id: str,
        user_message: str,
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Process a user message through the agent workflow
        
        Args:
            session_id: Chat session ID
            user_message: User's message
            user_id: Optional user ID
            
        Returns:
            Response data including AI message and metadata
        """
        from datetime import datetime
        from utils.session_manager import session_manager
        
        # Retrieve existing session to get conversation history
        session = await session_manager.get_session(session_id)
        
        # Get existing messages or start fresh
        existing_messages = session.get("messages", []) if session else []
        
        # Add new user message to history
        new_user_message = {
            "content": user_message,
            "sender": "user",
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": None
        }
        
        # Combine existing messages with new message for full context
        all_messages = existing_messages + [new_user_message]
        
        # Initialize state with FULL conversation history
        state: ConversationState = {
            "messages": all_messages,  # Include all previous messages for context
            "session_id": session_id,
            "user_id": user_id or (session.get("user_id") if session else None),
            "conversation_summary": session.get("conversation_summary", "") if session else "",
            "user_intent": "",
            "extracted_entities": {
                "watch_model": None,
                "brand": None,
                "price_range": None,
                "order_id": None,
                "category": None
            },
            "sentiment_score": session.get("sentiment_score", 0.0) if session else 0.0,
            "escalation_signals": session.get("escalation_signals", []) if session else [],
            "retrieved_products": session.get("last_retrieved_products", []) if session else [],
            "retrieval_score": 0.0,
            "ai_confidence": 0.0,
            "route": "",
            "ai_response": "",
            "agent_type": "",
            "consultation_active": session.get("consultation_active", False) if session else False,
            "consultation_step": "start",
            "collected_preferences": session.get("collected_preferences", {}) if session else {},
            "metadata": {}
        }
        
        # Run through workflow
        try:
            result = await self.graph.ainvoke(state)
            
            # Extract response data
            response_data = {
                "message": result.get("ai_response", "I apologize, but I'm having trouble processing your request."),
                "agent_type": result.get("agent_type", "unknown"),
                "confidence": result.get("ai_confidence", 0.0),
                "sentiment": result.get("sentiment_score", 0.0),
                "intent": result.get("user_intent", ""),
                "escalated": result.get("route") == "escalate",
                "metadata": {
                    "retrieved_products": result.get("retrieved_products", []),
                    "escalation_signals": result.get("escalation_signals", []),
                    "handoff_data": result.get("metadata", {}).get("handoff_data"),
                    "consultation_active": result.get("consultation_active", False),
                    "collected_preferences": result.get("collected_preferences", {})
                }
            }
            
            return response_data
            
        except Exception as e:
            print(f"✗ Workflow error: {e}")
            return {
                "message": "I apologize, but I encountered an error. Please try again or contact support.",
                "agent_type": "error",
                "confidence": 0.0,
                "sentiment": 0.0,
                "intent": "",
                "escalated": False,
                "metadata": {"error": str(e)}
            }


# Global workflow instance
agent_workflow = AgentWorkflow()
