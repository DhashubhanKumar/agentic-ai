const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.session.deleteMany();
    await prisma.watch.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleared existing data\n');

    // Create Brands
    console.log('📦 Creating brands...');
    const rolex = await prisma.brand.create({
        data: { name: 'Rolex' },
    });
    const patekPhilippe = await prisma.brand.create({
        data: { name: 'Patek Philippe' },
    });
    const titan = await prisma.brand.create({
        data: { name: 'Titan' },
    });
    const casio = await prisma.brand.create({
        data: { name: 'Casio' },
    });
    const fossil = await prisma.brand.create({
        data: { name: 'Fossil' },
    });
    console.log('✅ Created 5 brands\n');

    // Create Categories
    console.log('📂 Creating categories...');
    const luxury = await prisma.category.create({
        data: { name: 'Luxury' },
    });
    const sports = await prisma.category.create({
        data: { name: 'Sports' },
    });
    const casual = await prisma.category.create({
        data: { name: 'Casual' },
    });
    const smart = await prisma.category.create({
        data: { name: 'Smart' },
    });
    console.log('✅ Created 4 categories\n');

    // Create Watches
    console.log('⌚ Creating watches...');

    // Rolex watches (10)
    const rolexWatches = [
        { name: 'Submariner Date', price: 12500, category: luxury, description: 'Iconic dive watch with date function' },
        { name: 'GMT-Master II', price: 14200, category: luxury, description: 'Dual time zone watch for travelers' },
        { name: 'Daytona', price: 28500, category: sports, description: 'Legendary chronograph racing watch' },
        { name: 'Datejust 41', price: 9800, category: luxury, description: 'Classic dress watch with date' },
        { name: 'Explorer II', price: 10700, category: sports, description: 'Adventure watch for explorers' },
        { name: 'Yacht-Master', price: 15900, category: luxury, description: 'Nautical-inspired luxury watch' },
        { name: 'Sky-Dweller', price: 18500, category: luxury, description: 'Annual calendar with dual time zone' },
        { name: 'Sea-Dweller', price: 13250, category: sports, description: 'Professional dive watch' },
        { name: 'Air-King', price: 7400, category: casual, description: 'Aviation-inspired timepiece' },
        { name: 'Oyster Perpetual', price: 6200, category: casual, description: 'Classic Rolex design' },
    ];

    for (const watch of rolexWatches) {
        await prisma.watch.create({
            data: {
                name: watch.name,
                description: watch.description,
                price: watch.price,
                originalPrice: watch.price * 1.15,
                stock: Math.floor(Math.random() * 20) + 5,
                brandId: rolex.id,
                categoryId: watch.category.id,
                features: {
                    movement: 'Automatic',
                    waterResistance: '100m',
                    caseSize: '40mm',
                },
            },
        });
    }
    console.log('✅ Created 10 Rolex watches');

    // Patek Philippe watches (10)
    const patekWatches = [
        { name: 'Nautilus', price: 35000, category: luxury, description: 'Iconic luxury sports watch' },
        { name: 'Calatrava', price: 28000, category: luxury, description: 'Classic dress watch' },
        { name: 'Aquanaut', price: 32000, category: sports, description: 'Modern sports watch' },
        { name: 'Grand Complications', price: 125000, category: luxury, description: 'Ultimate complication watch' },
        { name: 'Twenty~4', price: 18500, category: casual, description: 'Elegant ladies watch' },
        { name: 'Gondolo', price: 24000, category: luxury, description: 'Art deco inspired timepiece' },
        { name: 'Complications', price: 45000, category: luxury, description: 'Advanced mechanical watch' },
        { name: 'Perpetual Calendar', price: 85000, category: luxury, description: 'Perpetual calendar complication' },
        { name: 'Chronograph', price: 42000, category: sports, description: 'Precision chronograph' },
        { name: 'World Time', price: 55000, category: luxury, description: 'Multiple time zone display' },
    ];

    for (const watch of patekWatches) {
        await prisma.watch.create({
            data: {
                name: watch.name,
                description: watch.description,
                price: watch.price,
                originalPrice: watch.price * 1.1,
                stock: Math.floor(Math.random() * 10) + 2,
                brandId: patekPhilippe.id,
                categoryId: watch.category.id,
                features: {
                    movement: 'Manual/Automatic',
                    waterResistance: '30m',
                    caseSize: '38mm',
                },
            },
        });
    }
    console.log('✅ Created 10 Patek Philippe watches');

    // Titan watches (10)
    const titanWatches = [
        { name: 'Edge Ceramic', price: 250, category: casual, description: 'Slim ceramic watch' },
        { name: 'Raga', price: 180, category: casual, description: 'Elegant ladies collection' },
        { name: 'Octane', price: 220, category: sports, description: 'Bold sports chronograph' },
        { name: 'Neo', price: 120, category: casual, description: 'Youth-oriented design' },
        { name: 'Purple', price: 200, category: casual, description: 'Colorful fashion watch' },
        { name: 'Automatics', price: 350, category: luxury, description: 'Automatic movement watch' },
        { name: 'Workwear', price: 160, category: casual, description: 'Professional work watch' },
        { name: 'Bandhan', price: 140, category: casual, description: 'Traditional Indian design' },
        { name: 'Stellar', price: 280, category: luxury, description: 'Premium collection' },
        { name: 'Smart Watch', price: 300, category: smart, description: 'Connected smartwatch' },
    ];

    for (const watch of titanWatches) {
        await prisma.watch.create({
            data: {
                name: watch.name,
                description: watch.description,
                price: watch.price,
                originalPrice: watch.price * 1.2,
                stock: Math.floor(Math.random() * 30) + 10,
                brandId: titan.id,
                categoryId: watch.category.id,
                features: {
                    movement: 'Quartz',
                    waterResistance: '50m',
                    caseSize: '42mm',
                },
            },
        });
    }
    console.log('✅ Created 10 Titan watches');

    // Casio watches (10)
    const casioWatches = [
        { name: 'G-Shock GA-2100', price: 110, category: sports, description: 'Rugged digital-analog watch' },
        { name: 'Pro Trek', price: 250, category: sports, description: 'Outdoor adventure watch' },
        { name: 'Edifice', price: 180, category: casual, description: 'Premium analog watch' },
        { name: 'Baby-G', price: 95, category: sports, description: 'Ladies sports watch' },
        { name: 'G-Shock Mudmaster', price: 320, category: sports, description: 'Mud-resistant tactical watch' },
        { name: 'Vintage A168', price: 45, category: casual, description: 'Retro digital watch' },
        { name: 'Oceanus', price: 450, category: luxury, description: 'Solar-powered titanium watch' },
        { name: 'G-Shock Rangeman', price: 280, category: sports, description: 'Triple sensor outdoor watch' },
        { name: 'Sheen', price: 120, category: casual, description: 'Elegant ladies watch' },
        { name: 'F-91W', price: 20, category: casual, description: 'Classic digital watch' },
    ];

    for (const watch of casioWatches) {
        await prisma.watch.create({
            data: {
                name: watch.name,
                description: watch.description,
                price: watch.price,
                originalPrice: watch.price * 1.25,
                stock: Math.floor(Math.random() * 50) + 20,
                brandId: casio.id,
                categoryId: watch.category.id,
                features: {
                    movement: 'Quartz/Digital',
                    waterResistance: '200m',
                    caseSize: '44mm',
                },
            },
        });
    }
    console.log('✅ Created 10 Casio watches');

    // Fossil watches (10)
    const fossilWatches = [
        { name: 'Gen 6 Smartwatch', price: 299, category: smart, description: 'Wear OS smartwatch' },
        { name: 'Neutra Chronograph', price: 155, category: casual, description: 'Modern chronograph' },
        { name: 'Grant Sport', price: 135, category: sports, description: 'Sporty chronograph' },
        { name: 'Jacqueline', price: 125, category: casual, description: 'Elegant ladies watch' },
        { name: 'Machine', price: 145, category: casual, description: 'Bold industrial design' },
        { name: 'Carlie Mini', price: 110, category: casual, description: 'Petite ladies watch' },
        { name: 'Townsman', price: 165, category: casual, description: 'Classic gentleman\'s watch' },
        { name: 'Hybrid Smartwatch', price: 195, category: smart, description: 'Analog with smart features' },
        { name: 'Nate', price: 175, category: sports, description: 'Rugged chronograph' },
        { name: 'Stella', price: 115, category: casual, description: 'Fashion-forward ladies watch' },
    ];

    for (const watch of fossilWatches) {
        await prisma.watch.create({
            data: {
                name: watch.name,
                description: watch.description,
                price: watch.price,
                originalPrice: watch.price * 1.3,
                stock: Math.floor(Math.random() * 40) + 15,
                brandId: fossil.id,
                categoryId: watch.category.id,
                features: {
                    movement: 'Quartz/Smart',
                    waterResistance: '50m',
                    caseSize: '42mm',
                },
            },
        });
    }
    console.log('✅ Created 10 Fossil watches');
    console.log('✅ Total: 50 watches created\n');

    // Create Test Users
    console.log('👤 Creating test users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            email: 'user@test.com',
            password: hashedPassword,
            name: 'Test User',
            address: '123 Main St, New York, NY 10001',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'john@example.com',
            password: hashedPassword,
            name: 'John Doe',
            address: '456 Oak Ave, Los Angeles, CA 90001',
        },
    });

    const aiAgent = await prisma.user.create({
        data: {
            email: 'ai@chronos.com',
            password: hashedPassword,
            name: 'Chronos AI Assistant',
            address: 'Virtual Assistant',
        },
    });

    console.log('✅ Created 3 users (including AI agent)\n');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 5 Brands (Rolex, Patek Philippe, Titan, Casio, Fossil)');
    console.log('  - 4 Categories (Luxury, Sports, Casual, Smart)');
    console.log('  - 50 Watches (10 per brand)');
    console.log('  - 3 Users (2 test users + 1 AI agent)');
    console.log('\n🔐 Test Login Credentials:');
    console.log('  Email: user@test.com');
    console.log('  Password: password123');
    console.log('\n  Email: john@example.com');
    console.log('  Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
