"""Agent 5: Decision-Making Agent - Response strategy and escalation logic"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import DECISION_EVALUATION_PROMPT
import json
import re


class DecisionMakingAgent:
    """Agent responsible for making decisions and calling tools"""
    
    def __init__(self, llm: ChatGroq, confidence_threshold: float = 0.5):
        self.llm = llm
        self.confidence_threshold = confidence_threshold
        
        self.system_prompt = """
        You are the Decision Agent for Chronos, a luxury watch store.
        Your goal is to decide the next action based on the user's message and context.
        
        AVAILABLE TOOLS:
        1. "search_products": Use when user asks for specific watches, brands, or browsing.
           Arguments: {"query": "string"}
           
        2. "update_address": Use when user explicitly asks to update their address.
           Arguments: {"new_address": "string"}
           
        3. "add_to_cart": Use when user wants to add a watch to their cart.
           Arguments: {"watch_id": "string", "quantity": number}

        4. "update_cart_quantity": Use when user wants to change quantity of an item ALREADY in their cart (e.g., "make it 5").
           Arguments: {"watch_id": "string", "quantity": number}
           
        5. "add_to_wishlist": Use when user wants to add a watch to their wishlist.
           Arguments: {"watch_id": "string"}

        6. "create_order": Use when user wants to place an order or buy items in their cart.
           Arguments: {"confirm": true}

        7. "clear_wishlist": Use when user wants to clear their wishlist.
           Arguments: {}

        8. "clear_cart": Use when user wants to clear their cart.
           Arguments: {}
           
        9. "get_orders": Use when user asks to see their orders or order history.
           Arguments: {}

        10. "wishlist_to_order": Use when user wants to buy items currently in their wishlist.
           Arguments: {}
           
        11. "wishlist_to_cart": Use when user wants to move items from wishlist to cart.
           Arguments: {}

        12. "escalate_to_human": Use when user is very angry, threatens legal action, or explicitly asks for a human/admin.
           Arguments: {"reason": "string"}
           
        13. "request_consultation": Use when user seems confused, frustrated (LOW/MEDIUM), or says "I don't know".
           Arguments: {"topic": "string"}

        9. "direct_response": Use for greetings, small talk, or general questions NOT about specific products.
           Arguments: {"response": "string"}
           
        PRISMA SCHEMA AWARENESS:
        - User (id, name, email, address, orders, cartItems, wishlist)
        - Watch (id, name, brandId, price, description, categoryId, stock, features)
        - CartItem (id, userId, watchId, quantity)
        - Order (id, userId, status, total, items)
        - OrderItem (id, orderId, watchId, quantity, price)

        USER CONTEXT AWARENESS:
        - You will be provided with "User Cart" and "User Wishlist" in the CONTEXT.
        - For questions like "what is in my cart?", "show my cart", "what's in my wishlist?" use "direct_response" and cite the cart/wishlist from CONTEXT.
        - When a user asks "add it to cart" and there are NO retrieved products but the item is in the wishlist, refer to the wishlist item.

        FRUSTRATION HANDLING:
        - If Frustration Level is HIGH: You MUST use "escalate_to_human".
        - If Frustration Level is MEDIUM or LOW/CONFUSED: You should use "request_consultation" to guide them.

        OUTPUT FORMAT:
        You MUST return a JSON object with "action" and "arguments".
        When adding or updating products, ALWAYS use the "id" from the RETRIEVED PRODUCTS in the CONTEXT. 
        If the product is not in the list, ask the user to specify which watch they mean.
        
        Example 1 (Search):
        {
            "action": "search_products",
            "arguments": {"query": "titan watches discount"}
        }
        
        Example 2 (Add to Cart):
        {
            "action": "add_to_cart",
            "arguments": {"watch_id": "cml5fby8n006txfdznk26rhss", "quantity": 1}
        }
        
        Example 3 (Chat):
        {
            "action": "direct_response",
            "arguments": {"response": "Hello! Welcome to Chronos. How can I assist you today?"}
        }
        """

    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """Process the conversation state and decide on action"""
        
        # Get latest message
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""
        
        # Simple prompt construction
        # Simple prompt construction
        context = f"Retrieved Products: {state.get('retrieved_products', [])}\n"
        context += f"Conversation Summary: {state.get('conversation_summary', '')}\n"
        context += f"Frustration Level: {state.get('frustration_level', 'low')}\n"
        
        # Inject User Context (Cart, Wishlist)
        user_id = state.get("user_id")
        if user_id:
            from tools.database_tools import get_user_context
            try:
                user_context = await get_user_context(user_id)
                cart_summary = ", ".join([f"{item['quantity']}x {item['name']}" for item in user_context.get('cart', [])]) or "Empty"
                wishlist_summary = ", ".join([item['name'] for item in user_context.get('wishlist', [])]) or "Empty"
                
                context += f"User Cart: {cart_summary}\n"
                context += f"User Wishlist: {wishlist_summary}\n"
            except Exception as e:
                print(f"Error fetching user context: {e}")
                context += "User Cart: Unknown (Error fetching)\n"
        
        prompt = f"{self.system_prompt}\n\nCONTEXT:\n{context}\n\nUSER MESSAGE: {last_message}\n\nDECISION JSON:"
        
        try:
            print(f"DEBUG Decision Agent: Processing message: '{last_message}'")
            response = await self.llm.ainvoke(prompt)
            content = response.content.replace('```json', '').replace('```', '').strip()
            
            try:
                decision = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from text if naive parse fails
                json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                if json_match:
                    try:
                        decision = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        # Even deeper cleanup - sometimes LLMs put text before/after JSON in a weird way
                        cleaned = re.sub(r'^.*?(\{.*\}).*$', r'\1', content, flags=re.DOTALL)
                        decision = json.loads(cleaned)
                else:
                    print(f"DEBUG Decision Agent: Failed to parse JSON from: {content}")
                    raise ValueError("Could not parse JSON from response")

            action = decision.get("action")
            args = decision.get("arguments", {})
            print(f"DEBUG Decision Agent: Decided action: {action} with args: {args}")
            
            # Execute Tools (Logic handled here for simplicity in this agent)
            # Dynamic imports to avoid circular deps if any
            from tools.database_tools import (
                search_products, update_address, clear_wishlist, clear_cart, 
                create_order_from_cart, execute_nlp_action, update_cart_quantity,
                get_user_context, get_user_orders, wishlist_to_order, wishlist_to_cart
            )
            from tools.email_tools import send_escalation_email
            
            state["route"] = "ai_response" # Default
            
            if action == "search_products":
                # Products were already retrieved by KnowledgeAgent, just use them
                products = state.get("retrieved_products", [])
                print(f"DEBUG Decision Agent: Using {len(products)} products from state")
                if products:
                    state["ai_response"] = f"I found {len(products)} timepieces matching your request."
                else:
                    # Graceful fallback for no results
                    state["ai_response"] = (
                        "I couldn't find any watches matching that exact description efficiently. "
                        "Could you try broadening your search? For example, try searching for just the brand or a style like 'Sport' or 'Dress'."
                    )
                    
            elif action in ["add_to_cart", "update_cart_quantity", "add_to_wishlist"]:
                # Use NLP-action endpoint for autonomous execution
                user_id = state.get("user_id")
                if user_id:
                    result = await execute_nlp_action(
                        user_message=last_message,
                        user_id=user_id,
                        conversation_context=messages[-5:],  # Last 5 messages
                        retrieved_products=state.get("retrieved_products", [])
                    )
                    if result.get("success"):
                        state["ai_response"] = result.get("message", "Done!")
                    else:
                        state["ai_response"] = f"I couldn't complete that action: {result.get('error', 'Unknown error')}"
                else:
                    state["ai_response"] = "Please login to manage your cart and wishlist."

            elif action == "update_address":
                user_id = state.get("user_id")
                if user_id:
                    success = await update_address(user_id, args.get("new_address", ""))
                    if success:
                        state["ai_response"] = f"I've updated your shipping address to: {args.get('new_address')}"
                    else:
                        state["ai_response"] = "I encountered an error updating your address."
                else:
                    state["ai_response"] = "I need you to be logged in to update your address."

            elif action == "create_order":
                user_id = state.get("user_id")
                if user_id:
                    result = await create_order_from_cart(user_id)
                    state["ai_response"] = result.get("message", "Order placed successfully.")
                else:
                    state["ai_response"] = "Please login to place an order."
                    
            elif action == "clear_wishlist":
                user_id = state.get("user_id")
                if user_id:
                    await clear_wishlist(user_id)
                    state["ai_response"] = "Your wishlist has been cleared."
                else:
                    state["ai_response"] = "Please login to manage your wishlist."

            elif action == "clear_cart":
                user_id = state.get("user_id")
                if user_id:
                    success = await clear_cart(user_id)
                    if success:
                        state["ai_response"] = "I've emptied your cart."
                    else:
                        state["ai_response"] = "I encountered an error clearing your cart."
                else:
                    state["ai_response"] = "Please login to manage your cart."
            
            elif action == "get_orders":
                user_id = state.get("user_id")
                if user_id:
                    orders = await get_user_orders(user_id)
                    if orders:

                        try:
                            order_lines = []
                            for o in orders[:5]:
                                date_str = o.get('createdAt', '').split('T')[0]
                                total = f"${o.get('total', 0):.2f}"
                                items_desc = ", ".join([f"{i['quantity']}x {i.get('watch', {}).get('name', 'Watch')}" for i in o.get('items', [])])
                                order_lines.append(f"**Order #{o['id'].split('-')[0]}** ({date_str}) - {total}\n   *Items: {items_desc}*")
                            
                            order_summary = "\n\n".join(order_lines)
                            state["ai_response"] = f"Here are your recent orders:\n\n{order_summary}"
                        except Exception as e:
                            print(f"Error formatting orders: {e}")
                            state["ai_response"] = "Here are your orders (raw data): " + str(orders[:3])
                    else:
                        state["ai_response"] = "You don't have any past orders."
                else:
                    state["ai_response"] = "Please login to view your orders."
            
            elif action == "wishlist_to_order":
                user_id = state.get("user_id")
                if user_id:
                    result = await wishlist_to_order(user_id)
                    state["ai_response"] = result.get("message", "Processed your wishlist order.")
                else:
                    state["ai_response"] = "Please login to place an order."
            
            elif action == "wishlist_to_cart":
                user_id = state.get("user_id")
                if user_id:
                    result = await wishlist_to_cart(user_id)
                    state["ai_response"] = result.get("message", "Moved items to cart.")
                else:
                    state["ai_response"] = "Please login to manage your list."
            
            elif action == "escalate_to_human":
                # Explicit handler for escalation action from LLM
                state["route"] = "escalate"
                state["ai_response"] = "I understand your frustration. I'm connecting you with a human agent."

            elif action == "request_consultation":
                state["route"] = "consultation"
                state["consultation_active"] = True
                state["ai_response"] = "I see you're looking for something specific. Let me help you find the perfect watch."
            
            else:
                # direct_response
                state["ai_response"] = args.get("response", "How can I help you regarding our luxury watches?")
                
            state["agent_type"] = "decision_agent"
            state["ai_confidence"] = 1.0
                
        except Exception as e:
            import traceback
            error_msg = str(e)
            print(f"Decision error: {error_msg}")
            
            if "Rate limit" in error_msg or "429" in error_msg:
                 state["ai_response"] = "I apologize, but I'm currently at maximum capacity (Rate Limit Reached). Please try again in about 15 minutes."
            else:
                 traceback.print_exc()
                 state["ai_response"] = "I apologize, I'm having temporary trouble processing your request."
            
            state["route"] = "ai_response"
            
        return state

def create_decision_agent(llm: ChatGroq, confidence_threshold: float = 0.5) -> DecisionMakingAgent:
    """Factory function to create decision agent"""
    return DecisionMakingAgent(llm, confidence_threshold)
