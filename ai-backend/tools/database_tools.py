import httpx
import logging
from typing import List, Dict, Any, Optional

from config import settings

# Base URL for Next.js API
API_BASE_URL = "http://127.0.0.1:3000/api"

async def execute_nlp_action(
    user_message: str,
    user_id: str,
    conversation_context: List[Dict[str, Any]] = [],
    retrieved_products: List[Dict[str, Any]] = []
) -> Dict[str, Any]:
    """
    Execute cart/wishlist/order actions using NLP
    
    Examples:
    - "add the cheapest watch to cart" → Finds cheapest → Adds to cart
    - "add that Rolex to wishlist" → Finds Rolex → Adds to wishlist
    - "buy the expensive one" → Finds expensive → Creates order
    """
    # Clean up retrieved_products to ensure brand is a string if it's an object
    cleaned_products = []
    for p in retrieved_products:
        cp = p.copy()
        if isinstance(cp.get("brand"), dict):
            cp["brand"] = cp["brand"].get("name", "Unknown")
        cleaned_products.append(cp)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/actions/execute-nlp-action",
                json={
                    "userMessage": user_message,
                    "userId": user_id,
                    "conversationContext": conversation_context,
                    "retrievedProducts": cleaned_products
                },
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"NLP Action API error (Status {response.status_code}): {response.text}")
                return {"success": False, "error": response.text}
    except Exception as e:
        print(f"Error calling NLP action API: {e}")
        return {"success": False, "error": str(e)}

async def add_to_cart(user_id: str, watch_id: str, quantity: int = 1) -> Dict[str, Any]:
    """Add a watch to the user's cart via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/cart/add",
                json={"watchId": watch_id, "quantity": quantity, "userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            return response.json()
    except Exception as e:
        print(f"Error calling add_to_cart API: {e}")
        return {"success": False, "error": str(e)}

async def add_to_wishlist(user_id: str, watch_id: str) -> Dict[str, Any]:
    """Add a watch to the user's wishlist via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/wishlist",
                json={"watchId": watch_id, "userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            return response.json()
    except Exception as e:
        print(f"Error calling add_to_wishlist API: {e}")
        return {"success": False, "error": str(e)}

async def search_products(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search for products using Next.js API proxy.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/products/search",
                json={"query": query},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("products", [])
            else:
                print(f"Search API error: {response.text}")
                return []
    except Exception as e:
        print(f"Error calling search API: {e}")
        return []

async def search_products_with_params(params: Dict[str, Any], limit: int = 10) -> List[Dict[str, Any]]:
    """
    NLP-to-SQL: Convert natural language parameters to structured Prisma query.
    
    Params can include:
    - brand: str - Filter by brand name
    - model: str - Filter by model name
    - maxPrice: int - Maximum price
    - minPrice: int - Minimum price
    - features: str - Features to search for
    - intent: str - "luxury", "affordable", "discount", "general"
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/products/search-structured",
                json={"params": params, "limit": limit},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("products", [])
            else:
                print(f"Structured search API error: {response.text}")
                return []
    except Exception as e:
        print(f"Error calling structured search API: {e}")
        return []

async def update_address(user_id: str, new_address: str) -> bool:
    """Update user's shipping address (Mock or need dedicated API)"""
    # For now, we mock success as we don't have a direct user update API for the backend to call easily without auth token
    # In a real app, we'd pass a service token.
    print(f"Mocking address update for {user_id} to {new_address}")
    return True

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile details"""
    # Mocking for now to avoid complexity of fetching from another API
    # Real implementation would call /api/auth/me or similar if exposed for backend
    return {
        "name": "Valued Customer",
        "email": "customer@example.com"
    }

async def get_user_cart(user_id: str) -> List[Dict[str, Any]]:
    """Get user's cart items"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_BASE_URL}/cart",
                params={"userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json().get("items", [])
            return []
    except Exception as e:
        print(f"Error calling get_user_cart API: {e}")
        return []

async def get_user_wishlist(user_id: str) -> List[Dict[str, Any]]:
    """Get user's wishlist items"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_BASE_URL}/wishlist",
                params={"userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json().get("items", [])
            return []
    except Exception as e:
        print(f"Error calling get_user_wishlist API: {e}")
        return []

async def get_user_orders(user_id: str) -> List[Dict[str, Any]]:
    """Get user's recent orders"""
    # Orders endpoint might not be exposed for backend yet, mocking/implementing simple fetch if possible
    # For now returning empty list or we can implement /api/orders GET similarly
    return [] 

async def get_user_context(user_id: str) -> Dict[str, Any]:
    """Aggregate all user context"""
    import asyncio
    cart, wishlist = await asyncio.gather(
        get_user_cart(user_id),
        get_user_wishlist(user_id)
    )
    return {
        "cart": cart,
        "wishlist": wishlist,
        "orders": [] # Placeholder until orders API is ready
    }

async def create_order_from_cart(user_id: str) -> Dict[str, Any]:
    """Create an order from user's active cart via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/actions/execute-nlp-action",
                json={
                    "userMessage": "place an order from my cart",
                    "userId": user_id,
                    "action": "create_order"
                },
                timeout=10.0
            )
            return response.json()
    except Exception as e:
        print(f"Error calling create_order API: {e}")
        return {"success": False, "error": str(e)}

async def update_cart_quantity(user_id: str, watch_id: str, quantity: int) -> Dict[str, Any]:
    """Update quantity of a watch in the user's cart via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/actions/execute-nlp-action",
                json={
                    "userMessage": f"update quantity to {quantity}",
                    "userId": user_id,
                    "action": "update_cart_quantity",
                    "watchId": watch_id,
                    "quantity": quantity
                },
                timeout=10.0
            )
            return response.json()
    except Exception as e:
        print(f"Error calling update_cart_quantity API: {e}")
        return {"success": False, "error": str(e)}

async def clear_cart(user_id: str) -> bool:
    """Clear user's cart via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{API_BASE_URL}/cart/clear",
                params={"userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            return response.status_code == 200
    except Exception as e:
        print(f"Error calling clear_cart API: {e}")
        return False

async def clear_wishlist(user_id: str) -> bool:
    """Clear user's wishlist via Next.js API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/actions/execute-nlp-action",
                json={
                    "userMessage": "clear my wishlist",
                    "userId": user_id,
                    "action": "clear_wishlist"
                },
                timeout=10.0
            )
            return response.status_code == 200
    except Exception as e:
        print(f"Error calling clear_wishlist API: {e}")
        return False

async def get_user_orders(user_id: str) -> List[Dict[str, Any]]:
    """Get user's recent orders"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_BASE_URL}/orders",
                params={"userId": user_id},
                headers={"X-Backend-Service-Key": settings.backend_service_key},
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json().get("orders", [])
            return []
    except Exception as e:
        print(f"Error calling get_user_orders API: {e}")
        return []

async def wishlist_to_order(user_id: str) -> Dict[str, Any]:
    """Create order from wishlist items"""
    return await execute_nlp_action(
        user_message="buy my wishlist",
        user_id=user_id,
        conversation_context=[],
        retrieved_products=[]
    )

async def wishlist_to_cart(user_id: str) -> Dict[str, Any]:
    """Move wishlist items to cart"""
    return await execute_nlp_action(
        user_message="move wishlist to cart",
        user_id=user_id,
        conversation_context=[],
        retrieved_products=[]
    )
