"""Agent 2: Knowledge & Retrieval Agent - RAG-based product and FAQ responses"""

from typing import Dict, Any, List
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import PRODUCT_EXPERTISE_PROMPT
from utils.vector_store import vector_store
import json


class KnowledgeRetrievalAgent:
    """RAG-based agent for product queries and FAQ responses"""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(PRODUCT_EXPERTISE_PROMPT)
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """
        Retrieve relevant products and generate response
        
        Args:
            state: Current conversation state
            
        Returns:
            Updated state with retrieved products and AI response
        """
        if not state.get("messages"):
            return state
        
        latest_message = state["messages"][-1]
        user_query = latest_message["content"]
        
        try:
            # Retrieve relevant products from database
            from tools.database_tools import search_products
            retrieved_docs = await search_products(user_query, limit=5)
            
            # Format product information
            product_context = self._format_products(retrieved_docs)
            
            # Get user order history (placeholder - would query database)
            order_history = "No previous orders"
            
            # Generate response using Groq
            chain = self.prompt | self.llm
            response = await chain.ainvoke({
                "retrieved_products": product_context,
                "user_order_history": order_history,
                "user_query": user_query
            })
            
            # Update state
            state["retrieved_products"] = retrieved_docs
            state["retrieval_score"] = 0.9 if retrieved_docs else 0.0
            state["ai_response"] = response.content
            state["agent_type"] = "knowledge"
            
            # Extract entities from products
            if retrieved_docs:
                top_product = retrieved_docs[0]
                state["extracted_entities"]["watch_model"] = top_product.get("name")
                state["extracted_entities"]["brand"] = top_product.get("brand")
            
            print(f"✓ Retrieved {len(retrieved_docs)} products, score: {state['retrieval_score']:.2f}")
            
        except Exception as e:
            print(f"✗ Knowledge retrieval error: {e}")
            state["ai_response"] = "I apologize, but I'm having trouble accessing product information right now. Could you please try again?"
            state["retrieval_score"] = 0.0
        
        return state
    
    def _format_products(self, products: List[Dict[str, Any]]) -> str:
        """Format product data for prompt context"""
        if not products:
            return "No products found matching the query."
        
        formatted = []
        for idx, doc in enumerate(products, 1):
            # Doc is now directly the product dict, not {metadata: ...}
            formatted.append(
                f"{idx}. {doc.get('name', 'Unknown')} by {doc.get('brand', 'Unknown')}\n"
                f"   Price: ${doc.get('price', 0):,.2f}\n"
                f"   Description: {doc.get('description', 'N/A')}\n"
            )
        
        return "\n".join(formatted)


def create_knowledge_agent(llm: ChatGroq) -> KnowledgeRetrievalAgent:
    """Factory function to create knowledge agent"""
    return KnowledgeRetrievalAgent(llm)
