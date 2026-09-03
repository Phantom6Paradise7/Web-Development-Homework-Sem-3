require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'High-end audio, laptops, smart accessories, and cutting-edge devices.',
    icon: 'laptop',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Contemporary apparel, outerwear, premium streetwear, and timeless classics.',
    icon: 'shirt',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Performance sneakers, designer runners, lifestyle kicks, and boots.',
    icon: 'footprints',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Minimalist decor, modern desk setups, smart lighting, and kitchenware.',
    icon: 'home',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Minimalist watches, leather bags, sunglasses, and EDC gear.',
    icon: 'watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  }
];

const sampleProducts = [
  {
    name: 'Aura Studio Wireless ANC Headphones',
    slug: 'aura-studio-wireless-anc-headphones',
    brand: 'Acoustix',
    category: 'Electronics',
    description: 'Engineered for audiophiles. Features industry-leading Active Noise Cancellation, 40mm beryllium drivers, spatial audio tracking, and up to 45 hours of immersive playtime on a single fast charge.',
    features: [
      'Hybrid Active Noise Cancellation with Transparency Mode',
      'Custom 40mm Beryllium High-Resolution Drivers',
      '45-Hour Ultra Battery Life with USB-C Quick Charge',
      'Plush memory foam magnetic ear cushions'
    ],
    specs: [
      { key: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Aux' },
      { key: 'Battery', value: '45 Hours ANC On' },
      { key: 'Weight', value: '250g' },
      { key: 'Warranty', value: '2 Years Manufacturer' }
    ],
    price: 249.99,
    originalPrice: 329.99,
    discountPercent: 24,
    stock: 28,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 42,
    isFeatured: true,
    isTrending: true,
    badge: 'Best Seller'
  },
  {
    name: 'Veloce Pro Mechanical Keyboard RGB',
    slug: 'veloce-pro-mechanical-keyboard-rgb',
    brand: 'KeyCraft',
    category: 'Electronics',
    description: 'A 75% compact wireless mechanical keyboard with hot-swappable switches, lubed stabilizers, gasket mount design, and customizable per-key RGB backlighting.',
    features: [
      'Hot-swappable tactile pre-lubed switches',
      'Double-shot PBT Cherry profile keycaps',
      'Multi-device Tri-mode connectivity (2.4G / BT / Wired)',
      'Gasket mounted with sound dampening poron foam'
    ],
    specs: [
      { key: 'Layout', value: '75% Compact (82 Keys)' },
      { key: 'Battery', value: '4000mAh Rechargeable' },
      { key: 'Compatibility', value: 'Windows / macOS / iOS / Android' }
    ],
    price: 119.50,
    originalPrice: 149.00,
    discountPercent: 20,
    stock: 19,
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 38,
    isFeatured: true,
    isTrending: true,
    badge: 'Popular'
  },
  {
    name: 'NeoSport Air Zoom Velocity Runners',
    slug: 'neosport-air-zoom-velocity-runners',
    brand: 'NeoSport',
    category: 'Footwear',
    description: 'Crafted for marathon endurance and street style. Features nitrogen-infused responsive foam cushioning, breathable engineered mesh upper, and high-traction rubber outsole.',
    features: [
      'NitroFoam max-energy rebound midsole',
      'Dynamic flywire arch support',
      'Reflective elements for night safety',
      'Lightweight breathable warp-knit upper'
    ],
    specs: [
      { key: 'Drop', value: '8mm' },
      { key: 'Weight', value: '215g (Size 9)' },
      { key: 'Terrain', value: 'Road / Treadmill' }
    ],
    price: 139.99,
    originalPrice: 179.99,
    discountPercent: 22,
    stock: 15,
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 29,
    isFeatured: true,
    isTrending: true,
    badge: 'Hot Deal'
  },
  {
    name: 'Classic Chronograph Minimalist Watch',
    slug: 'classic-chronograph-minimalist-watch',
    brand: 'Nordic Heritage',
    category: 'Accessories',
    description: 'Scandinavian minimalist timepiece forged with 316L stainless steel case, sapphire crystal glass, genuine Italian calfskin leather strap, and Japanese precision quartz movement.',
    features: [
      'Scratch-resistant Sapphire crystal dome',
      '5 ATM / 50 meters water resistance',
      'Italian full-grain quick-release leather strap',
      'Dual sub-dial 60-minute stopwatch'
    ],
    specs: [
      { key: 'Case Size', value: '40mm Diameter, 8.5mm Depth' },
      { key: 'Strap Width', value: '20mm' },
      { key: 'Glass', value: 'Anti-reflective Sapphire' }
    ],
    price: 185.00,
    originalPrice: 230.00,
    discountPercent: 20,
    stock: 22,
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 54,
    isFeatured: true,
    isTrending: false,
    badge: 'Staff Pick'
  },
  {
    name: 'Artisan Ceramic Pour-Over Coffee Set',
    slug: 'artisan-ceramic-pour-over-coffee-set',
    brand: 'Komorebi Home',
    category: 'Home & Living',
    description: 'Handcrafted stoneware pour-over dripper with thermal insulated glass carafe. Designed for precise flow rate and maximum flavor extraction from specialty coffee roasts.',
    features: [
      'Handmade textured matte stoneware finish',
      'Double-walled borosilicate glass carafe (600ml)',
      'Optimal 60-degree conical extraction angle',
      'Dishwasher safe and heat-resistant up to 200°C'
    ],
    specs: [
      { key: 'Capacity', value: '600 ml (2-4 Cups)' },
      { key: 'Material', value: 'Ceramic Stoneware + Glass' },
      { key: 'Includes', value: 'Dripper, Server, 40 Filters' }
    ],
    price: 58.00,
    originalPrice: 75.00,
    discountPercent: 23,
    stock: 35,
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 18,
    isFeatured: false,
    isTrending: true,
    badge: 'Eco-Friendly'
  },
  {
    name: 'Heavyweight French Terry Oversized Hoodie',
    slug: 'heavyweight-french-terry-oversized-hoodie',
    brand: 'Atelier Noir',
    category: 'Fashion',
    description: 'Custom milled 480 GSM organic cotton french terry hoodie. Features dropped shoulders, a double-layered hood without drawstrings for clean silhouette, and ribbed cuff trims.',
    features: [
      '100% GOTS Certified Organic Cotton (480 GSM)',
      'Pre-shrunk fabric to preserve boxy relaxed drape',
      'Seamless kangaroo front utility pocket',
      'Reinforced double-needle flatlock seams'
    ],
    specs: [
      { key: 'Fit', value: 'Boxy / Oversized' },
      { key: 'Material', value: '480 GSM French Terry' },
      { key: 'Care', value: 'Machine Wash Cold / Air Dry' }
    ],
    price: 89.00,
    originalPrice: 110.00,
    discountPercent: 19,
    stock: 40,
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.6,
    numReviews: 31,
    isFeatured: false,
    isTrending: true,
    badge: 'Trending'
  },
  {
    name: 'Ultra-Slim 4K Magnetic Webcam & Ring Light',
    slug: 'ultra-slim-4k-magnetic-webcam-ring-light',
    brand: 'LuminaTech',
    category: 'Electronics',
    description: 'Professional streaming and conference camera boasting a Sony STARVIS 4K sensor, AI facial framing, dual studio-grade beamforming microphones, and integrated bi-color LED ring light.',
    features: [
      'True 4K UHD @ 60FPS with HDR low-light enhancement',
      'Integrated touch-dimmable bi-color LED fill light',
      'Dual noise-cancelling directional microphones',
      'Magnetic privacy shutter & multi-angle monitor mount'
    ],
    specs: [
      { key: 'Resolution', value: '3840 x 2160p @ 60 FPS' },
      { key: 'FOV', value: 'Adjustable 65° / 78° / 90°' },
      { key: 'Interface', value: 'USB-C Plug and Play' }
    ],
    price: 129.99,
    originalPrice: 169.99,
    discountPercent: 24,
    stock: 12,
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 23,
    isFeatured: true,
    isTrending: false,
    badge: 'Tech Award'
  },
  {
    name: 'Full-Grain Leather Weekender Duffle Bag',
    slug: 'full-grain-leather-weekender-duffle-bag',
    brand: 'Voyager & Co.',
    category: 'Accessories',
    description: 'Handcrafted vegetable-tanned full grain cowhide leather travel bag. Features dedicated shoe compartment, water-resistant twill lining, and antique brass YKK hardware.',
    features: [
      'Vegetable-tanned full-grain leather that patinas beautifully',
      'Ventilated side compartment for shoes or laundry',
      'Padded sleeve fits up to 16-inch laptops',
      'Detachable ergonomic padded shoulder strap'
    ],
    specs: [
      { key: 'Capacity', value: '42 Liters (Airline Carry-On Compliant)' },
      { key: 'Dimensions', value: '21" L x 11.5" H x 10" W' },
      { key: 'Weight', value: '1.9 kg' }
    ],
    price: 219.00,
    originalPrice: 280.00,
    discountPercent: 22,
    stock: 8,
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 27,
    isFeatured: true,
    isTrending: true,
    badge: 'Premium Pick'
  },
  {
    name: 'Smart Ambient Sunset Glow Desk Lamp',
    slug: 'smart-ambient-sunset-glow-desk-lamp',
    brand: 'AuraLiving',
    category: 'Home & Living',
    description: 'Architectural aluminum task and ambient lamp with 16 million colors, stepless warm-to-cool white tuning (2200K - 6500K), app control, and wireless Qi phone charging dock at base.',
    features: [
      '15W fast wireless Qi charger built into weighted base',
      'App and touch control with circadian rhythm schedule',
      'Flicker-free eye comfort diffuser lens (CRI > 95)',
      'Precision machined matte anodized aluminum arm'
    ],
    specs: [
      { key: 'Brightness', value: '1000 Lumens Max' },
      { key: 'Color Temp', value: '2200K - 6500K Tunable' },
      { key: 'Power', value: 'AC 100-240V Adapter Included' }
    ],
    price: 79.99,
    originalPrice: 99.99,
    discountPercent: 20,
    stock: 25,
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.6,
    numReviews: 19,
    isFeatured: false,
    isTrending: false,
    badge: 'New'
  },
  {
    name: 'Chelsea Boots Waterproof Italian Suede',
    slug: 'chelsea-boots-waterproof-italian-suede',
    brand: 'Stride London',
    category: 'Footwear',
    description: 'Timeless Chelsea boot crafted with weather-treated Italian calf suede, Goodyear welted construction, elasticated side gussets, and storm-welt Dainite rubber soles.',
    features: [
      'Hydrophobic treated water & stain resistant suede',
      'Classic Goodyear welt construction (fully resoleable)',
      'Supple vegetable-tanned leather lining and insole',
      'Durable studded rubber traction outsole'
    ],
    specs: [
      { key: 'Upper', value: 'Premium Italian Calf Suede' },
      { key: 'Sole', value: 'Studded Rubber Dainite Style' },
      { key: 'Origin', value: 'Handmade in Portugal' }
    ],
    price: 195.00,
    originalPrice: 245.00,
    discountPercent: 20,
    stock: 14,
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 22,
    isFeatured: false,
    isTrending: true,
    badge: 'Editor Choice'
  },
  {
    name: 'Smart Carbon Fiber RFID Blocking Wallet',
    slug: 'smart-carbon-fiber-rfid-blocking-wallet',
    brand: 'AeroGear',
    category: 'Accessories',
    description: 'Ultra-compact cardholder made of military-grade 3K matte carbon fiber. Features instant eject mechanism, integrated Apple AirTag slot, and tactical money clip.',
    features: [
      'Holds 1-12 cards without stretching',
      'Rapid card fan-out quick access trigger',
      'Integrated hidden AirTag tracker enclosure',
      'Complete RFID/NFC signal blocking security'
    ],
    specs: [
      { key: 'Weight', value: '62 grams' },
      { key: 'Thickness', value: '8.6 mm' },
      { key: 'Material', value: 'Forged Carbon Fiber & T6 Aluminum' }
    ],
    price: 49.00,
    originalPrice: 65.00,
    discountPercent: 25,
    stock: 50,
    thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 65,
    isFeatured: false,
    isTrending: false,
    badge: 'Popular'
  },
  {
    name: 'Tailored Merino Wool Blazer Jacket',
    slug: 'tailored-merino-wool-blazer-jacket',
    brand: 'Sartorial Studio',
    category: 'Fashion',
    description: 'Modern unconstructed blazer tailored from breathable Australian Super 120s Merino wool. Features soft shoulders, notch lapels, patch pockets, and cupro sleeve lining.',
    features: [
      'Super 120s crease-resistant natural stretch wool',
      'Unlined body for maximum breathability & drape',
      'Genuine horn buttons with functional cuff buttonholes',
      'Interior passport and pen pocket'
    ],
    specs: [
      { key: 'Fabric', value: '100% Merino Wool' },
      { key: 'Style', value: 'Single-breasted 2-button' },
      { key: 'Care', value: 'Dry Clean Only' }
    ],
    price: 279.00,
    originalPrice: 350.00,
    discountPercent: 20,
    stock: 11,
    thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 16,
    isFeatured: false,
    isTrending: false,
    badge: 'Luxury'
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Inserted ${createdCategories.length} categories.`);

    // 2. Create Users
    // Admin user
    const adminUser = new User({
      name: 'Admin Store Manager',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2834'
    });
    await adminUser.save();

    // Customer user
    const customerUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1 (555) 432-8765',
      addresses: [
        {
          fullName: 'John Doe',
          phone: '+1 (555) 432-8765',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'Oregon',
          postalCode: '97477',
          country: 'United States',
          isDefault: true
        }
      ]
    });
    await customerUser.save();
    console.log('[Seed] Created Admin (admin@store.com) and Customer (john@example.com).');

    // 3. Create Products with sample reviews
    const productsToInsert = sampleProducts.map(p => {
      return {
        ...p,
        reviews: [
          {
            user: customerUser._id,
            name: customerUser.name,
            rating: 5,
            comment: 'Absolutely exceeded my expectations! Incredible build quality, sleek design, and fast delivery.',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            user: adminUser._id,
            name: 'Sarah Jenkins',
            rating: 4.5,
            comment: 'Very premium touch and feel. Matches the photos perfectly. Would highly recommend!',
            isVerifiedPurchase: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ]
      };
    });

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Inserted ${createdProducts.length} rich products.`);

    // 4. Create an initial sample order for the customer
    const sampleOrder = new Order({
      orderNumber: 'ORD-2026-1042',
      user: customerUser._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].thumbnail,
          price: createdProducts[0].price,
          quantity: 1
        },
        {
          product: createdProducts[3]._id,
          name: createdProducts[3].name,
          image: createdProducts[3].thumbnail,
          price: createdProducts[3].price,
          quantity: 1
        }
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      paymentDetails: {
        transactionId: 'TXN-CONFIRMED-8831',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      itemsPrice: createdProducts[0].price + createdProducts[3].price,
      taxPrice: 21.75,
      shippingPrice: 0,
      discountPrice: 0,
      totalPrice: createdProducts[0].price + createdProducts[3].price + 21.75,
      orderStatus: 'shipped',
      trackingEvents: [
        {
          status: 'placed',
          message: 'Order placed and payment authorized',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          location: 'Shopease Fulfillment Hub'
        },
        {
          status: 'processing',
          message: 'Items packed in eco-friendly protective packaging',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          location: 'Sorting Facility'
        },
        {
          status: 'shipped',
          message: 'Carrier picked up parcel. In transit to destination.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          location: 'Regional Distribution Center'
        }
      ]
    });
    await sampleOrder.save();
    console.log('[Seed] Created sample order: ORD-2026-1042');

    console.log('\n[Seed Success] Database populated cleanly!');
    console.log('--------------------------------------------------');
    console.log('Customer Account: john@example.com / customer123');
    console.log('Admin Account:    admin@store.com / admin123');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seed();
