// Simple test script to verify API endpoints
// Run with: node test-api.js

async function testAPIs() {
    console.log('Testing API endpoints...\n');

    // Test 1: Check auth
    console.log('1. Testing /api/auth/me');
    const authRes = await fetch('http://localhost:3000/api/auth/me');
    const authData = await authRes.json();
    console.log('Auth response:', authData);

    if (!authData.user) {
        console.log('\n⚠️  Not logged in. Please login first.\n');
        return;
    }

    console.log('\n✅ Logged in as:', authData.user.email);

    // Test 2: Add to cart
    console.log('\n2. Testing POST /api/cart/add');
    const addCartRes = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchId: 'test-watch-id' }),
    });
    const addCartData = await addCartRes.json();
    console.log('Add to cart response:', addCartData);

    // Test 3: Get cart
    console.log('\n3. Testing GET /api/cart');
    const cartRes = await fetch('http://localhost:3000/api/cart');
    const cartData = await cartRes.json();
    console.log('Cart response:', cartData);

    // Test 4: Add to wishlist
    console.log('\n4. Testing POST /api/wishlist');
    const addWishlistRes = await fetch('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchId: 'test-watch-id' }),
    });
    const addWishlistData = await addWishlistRes.json();
    console.log('Add to wishlist response:', addWishlistData);

    // Test 5: Get wishlist
    console.log('\n5. Testing GET /api/wishlist');
    const wishlistRes = await fetch('http://localhost:3000/api/wishlist');
    const wishlistData = await wishlistRes.json();
    console.log('Wishlist response:', wishlistData);
}

testAPIs().catch(console.error);
