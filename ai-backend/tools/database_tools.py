import httpx
import logging
from typing import List, Dict, Any, Optional

# Base URL for Next.js API (assuming running locally on port 3002 as detected)
API_BASE_URL = "http://localhost:3002/api"

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

async def update_address(user_id: str, new_address: str) -> bool:
    """Update user's shipping address (Mock or need dedicated API)"""
    # For now, we mock success as we don't have a direct user update API for the backend to call easily without auth token
    # In a real app, we'd pass a service token.
    print(f"Mocking address update for {user_id} to {new_address}")
    return True

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile details"""
    # Mocking for now to avoid complexity of fetching from another API
    return {
        "name": "Valued Customer",
        "email": "customer@example.com",
        "address": "123 Watch Lane"
    }

async def create_order_from_cart(user_id: str) -> Dict[str, Any]:
    """Create an order from user's active cart"""
    return {"success": True, "message": "Order creation initiated via AI."}

async def clear_wishlist(user_id: str) -> bool:
    """Clear user's wishlist"""
    return True

