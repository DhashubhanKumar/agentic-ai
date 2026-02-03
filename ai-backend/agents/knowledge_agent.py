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
            # Get recent conversation context (last 5 messages)
            recent_messages = state.get("messages", [])[-5:]
            conversation_context = "\n".join([
                f"{msg.get('sender', 'unknown').upper()}: {msg.get('content', '')}"
                for msg in recent_messages[:-1]  # Exclude current message
            ])
            
            # Use LLM to extract structured search parameters with conversation context
            extraction_prompt = f"""Analyze this watch search query and extract search parameters as JSON.
Consider the conversation history to understand context and references.

Conversation History:
{conversation_context if conversation_context else "No previous conversation"}

Current User Query: "{user_query}"

Extract the following parameters (or infer from context):

1. BRAND: brand name if mentioned (e.g., "Rolex", "Patek Philippe", "Titan", "Casio", "Fossil")

2. MODEL: specific model name if mentioned (e.g., "Submariner", "Daytona", "G-Shock")

3. PRICE FILTERS:
   - maxPrice: Extract if user says "under X", "below X", "less than X", "cheaper than X"
   - minPrice: Extract if user says "above X", "over X", "more than X", "at least X"
   - For "between X and Y": set minPrice=X, maxPrice=Y
   - For "expensive", "most expensive", "costliest": set intent="luxury"
   - For "cheapest", "affordable", "cheap": set intent="affordable"
   - IMPORTANT: Extract actual numbers from queries like "between 10000 and 50000"

4. INTENT: Classify as one of:
   - "luxury" if mentions expensive, premium, high-end, costliest, or price > 5000
   - "affordable" if mentions cheap, budget, affordable, cheapest, or price < 1000
   - "discount" if mentions sale, discount, deal
   - "general" otherwise

5. FEATURES: Extract if mentioned (e.g., "chronograph", "automatic", "diving", "smartwatch")

CRITICAL RULES:
- If user says "cheapest", set intent to "affordable"
- If user says "costliest" or "most expensive", set intent to "luxury"
- Numbers in queries should be extracted as-is (e.g., "10000" stays 10000, not 10)
- If referring to previous conversation products, extract their characteristics

Return ONLY valid JSON, no markdown, no explanation:
{{"brand": "BrandName", "maxPrice": 50000, "minPrice": 10000, "intent": "luxury"}}

If nothing specific found, return: {{"intent": "general"}}"""

            ext_response = await self.llm.ainvoke(extraction_prompt)
            params_text = ext_response.content.strip()
            
            # Clean up markdown code blocks if present
            if params_text.startswith("```"):
                params_text = params_text.split("\n", 1)[1]
                params_text = params_text.rsplit("```", 1)[0]
            params_text = params_text.strip()
            
            # Parse JSON
            import json
            search_params = json.loads(params_text)
            print(f"DEBUG: Extracted search params: {search_params}")

            # Retrieve relevant products from database
            from tools.database_tools import search_products_with_params
            retrieved_docs = await search_products_with_params(search_params, limit=10)
            print(f"DEBUG: Retrieved {len(retrieved_docs)} products")
            
            # Format product information
            product_context = self._format_products(retrieved_docs)
            
            # Get user order history (placeholder - would query database)
            order_history = "No previous orders"
            
            # Generate response using Groq
            chain = self.prompt | self.llm
            response = await chain.ainvoke({
                "retrieved_products": product_context,
                "user_order_history": order_history,
                "user_query": user_query,
                "user_details": state.get("user_profile", "Anonymous User")
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
