#!/bin/bash

echo "🧪 Testing Complete Cart Flow"
echo "=============================="
echo ""

# Step 1: Register a new user
echo "1️⃣ Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test123","name":"Test User"}' \
  -c cookies.txt)

echo "Register response: $REGISTER_RESPONSE"
echo ""

# Step 2: Add item to cart (should work now with session cookie)
echo "2️⃣ Adding item to cart..."
ADD_CART_RESPONSE=$(curl -s -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"watchId":"cml5fcbkx009hxfdz1epew52x"}' \
  -b cookies.txt)

echo "Add to cart response: $ADD_CART_RESPONSE"
echo ""

# Step 3: Get cart
echo "3️⃣ Getting cart..."
GET_CART_RESPONSE=$(curl -s http://localhost:3000/api/cart -b cookies.txt)

echo "Get cart response: $GET_CART_RESPONSE"
echo ""

# Cleanup
rm -f cookies.txt

echo "✅ Test complete!"
