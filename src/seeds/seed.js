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
    description: 'Studio acoustics, mechanical keyboards, 4K streaming cameras, and smart gadgets.',
    icon: '🎧',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Heavyweight organic hoodies, tailored wool blazers, modern minimalist streetwear.',
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'High-rebound nitrogen runners, waterproof Chelsea boots, and designer lifestyle kicks.',
    icon: '👟',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Artisan ceramic pour-over sets, smart ambient lamps, architectural decor essentials.',
    icon: '☕',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Minimalist chronograph watches, full-grain weekender bags, tactical RFID wallets.',
    icon: '⌚',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    description: 'Botanical hyaluronic facial serums, organic restoring balms, clean grooming sets.',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Insulated vacuum fitness bottles, ballistic gym gear, ergonomic trail packs.',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  },
  {
    name: 'Workstation & Gaming',
    slug: 'workstation-gaming',
    description: 'Ergonomic wool desk mats, aluminum boom arms, ambient studio monitor lights.',
    icon: '🖥️',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
    isFeatured: true
  }
];

const sampleProducts = [
  // 1. Electronics
  {
    name: 'Aura Studio Wireless ANC Headphones',
    slug: 'aura-studio-wireless-anc-headphones',
    brand: 'Acoustix Labs',
    category: 'Electronics',
    description: 'Engineered for discerning audiophiles. Features custom 40mm Beryllium acoustic drivers, adaptive hybrid active noise cancellation, spatial sound staging, and 45 hours of immersive playtime on a single USB-C charge.',
    features: [
      'Hybrid Active Noise Cancellation with Ambient Transparency',
      'Custom 40mm Beryllium High-Resolution Drivers',
      '45-Hour Ultra Battery Life with USB-C Quick Charge',
      'Plush memory foam magnetic replaceable ear cushions'
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
    ratings: 4.9,
    numReviews: 48,
    isFeatured: true,
    isTrending: true,
    badge: 'Best Seller'
  },
  {
    name: 'Veloce Pro Mechanical Keyboard RGB',
    slug: 'veloce-pro-mechanical-keyboard-rgb',
    brand: 'KeyCraft',
    category: 'Electronics',
    description: 'A 75% compact wireless mechanical keyboard with hot-swappable tactile switches, pre-lubed stabilizers, gasket mount dampening structure, and per-key customizable South-facing RGB lighting.',
    features: [
      'Hot-swappable tactile pre-lubed mechanical switches',
      'Double-shot PBT Cherry profile durable keycaps',
      'Multi-device Tri-mode connectivity (2.4G / Bluetooth / USB-C)',
      'Gasket mounted with sound-dampening poron foam sandwich'
    ],
    specs: [
      { key: 'Layout', value: '75% Compact (82 Keys)' },
      { key: 'Battery', value: '4000mAh Rechargeable' },
      { key: 'Compatibility', value: 'macOS / Windows / Linux / iOS' }
    ],
    price: 119.50,
    originalPrice: 149.00,
    discountPercent: 20,
    stock: 19,
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 34,
    isFeatured: true,
    isTrending: true,
    badge: 'Popular'
  },
  {
    name: 'Ultra-Slim 4K Magnetic Webcam & Fill Light',
    slug: 'ultra-slim-4k-magnetic-webcam-fill-light',
    brand: 'LuminaTech',
    category: 'Electronics',
    description: 'Broadcast studio quality in an ultra-compact form factor. Features a Sony 4K sensor, AI auto-framing, dual noise-cancelling directional mics, and integrated bi-color ring illumination.',
    features: [
      'True 4K UHD @ 60FPS with HDR low-light sensor',
      'Integrated touch-dimmable bi-color LED fill ring',
      'Dual noise-cancelling beamforming microphones',
      'Magnetic privacy cover and universal monitor clamp'
    ],
    specs: [
      { key: 'Resolution', value: '3840 x 2160p @ 60 FPS' },
      { key: 'FOV', value: '65° / 78° / 90° Adjustable' },
      { key: 'Interface', value: 'USB-C 3.2 Gen 1' }
    ],
    price: 129.99,
    originalPrice: 169.99,
    discountPercent: 24,
    stock: 4, // Low stock demo
    thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 22,
    isFeatured: false,
    isTrending: true,
    badge: 'Low Stock'
  },

  // 2. Footwear
  {
    name: 'NeoSport Air Zoom Velocity Runners',
    slug: 'neosport-air-zoom-velocity-runners',
    brand: 'NeoSport',
    category: 'Footwear',
    description: 'Engineered for marathon endurance and effortless street style. Features nitrogen-infused rebound foam midsole, breathable warp-knit upper, and carbon fiber stabilizer plate.',
    features: [
      'NitroFoam max-energy rebound midsole',
      'Dynamic flywire arch stabilization',
      'Reflective 3M elements for night visibility',
      'Ultra-lightweight breathable warp-knit upper'
    ],
    specs: [
      { key: 'Drop', value: '8mm' },
      { key: 'Weight', value: '215g (Size 9)' },
      { key: 'Terrain', value: 'Road / Track / Street' }
    ],
    price: 139.99,
    originalPrice: 179.99,
    discountPercent: 22,
    stock: 15,
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 41,
    isFeatured: true,
    isTrending: true,
    badge: 'Hot Deal'
  },
  {
    name: 'Chelsea Boots Waterproof Italian Suede',
    slug: 'chelsea-boots-waterproof-italian-suede',
    brand: 'Stride London',
    category: 'Footwear',
    description: 'Timeless Chelsea boot crafted with weather-treated Italian calf suede, Goodyear welted resoleable construction, elasticated side gussets, and studded Dainite rubber soles.',
    features: [
      'Hydrophobic treated water & stain resistant suede',
      'Classic Goodyear welt construction (fully resoleable)',
      'Supple vegetable-tanned leather lining and insole',
      'Durable studded rubber traction outsole'
    ],
    specs: [
      { key: 'Upper', value: 'Premium Italian Calf Suede' },
      { key: 'Sole', value: 'Studded Rubber Dainite' },
      { key: 'Origin', value: 'Handmade in Portugal' }
    ],
    price: 195.00,
    originalPrice: 245.00,
    discountPercent: 20,
    stock: 12,
    thumbnail: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 29,
    isFeatured: false,
    isTrending: true,
    badge: 'Staff Pick'
  },

  // 3. Fashion
  {
    name: 'Heavyweight French Terry Oversized Hoodie',
    slug: 'heavyweight-french-terry-oversized-hoodie',
    brand: 'Atelier Noir',
    category: 'Fashion',
    description: 'Custom milled 480 GSM organic cotton french terry hoodie. Features dropped relaxed shoulders, double-layered hood without drawstrings for clean silhouette, and ribbed cuff trims.',
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
    stock: 35,
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 38,
    isFeatured: true,
    isTrending: true,
    badge: 'Trending'
  },
  {
    name: 'Tailored Merino Wool Blazer Jacket',
    slug: 'tailored-merino-wool-blazer-jacket',
    brand: 'Sartorial Studio',
    category: 'Fashion',
    description: 'Modern unconstructed blazer tailored from breathable Australian Super 120s Merino wool. Features soft natural shoulders, notch lapels, patch pockets, and cupro sleeve lining.',
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
    stock: 8,
    thumbnail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 19,
    isFeatured: false,
    isTrending: false,
    badge: 'Luxury'
  },

  // 4. Home & Living
  {
    name: 'Artisan Ceramic Pour-Over Coffee Set',
    slug: 'artisan-ceramic-pour-over-coffee-set',
    brand: 'Komorebi Home',
    category: 'Home & Living',
    description: 'Handcrafted stoneware pour-over dripper with thermal double-walled borosilicate glass carafe. Designed for precise flow rate and maximum flavor extraction from specialty coffee roasts.',
    features: [
      'Handmade textured matte stoneware finish',
      'Double-walled borosilicate glass carafe (600ml)',
      'Optimal 60-degree conical extraction angle',
      'Dishwasher safe and thermal shock resistant'
    ],
    specs: [
      { key: 'Capacity', value: '600 ml (2-4 Cups)' },
      { key: 'Material', value: 'Ceramic Stoneware + Glass' },
      { key: 'Includes', value: 'Dripper, Server, 40 Filters' }
    ],
    price: 58.00,
    originalPrice: 75.00,
    discountPercent: 23,
    stock: 22,
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 24,
    isFeatured: false,
    isTrending: true,
    badge: 'Eco-Friendly'
  },
  {
    name: 'Smart Ambient Sunset Glow Desk Lamp',
    slug: 'smart-ambient-sunset-glow-desk-lamp',
    brand: 'AuraLiving',
    category: 'Home & Living',
    description: 'Architectural aluminum task and ambient lamp with 16 million colors, stepless warm-to-cool white tuning (2200K - 6500K), app control, and fast wireless Qi phone charging dock at base.',
    features: [
      '15W fast wireless Qi charger built into weighted base',
      'App and touch control with circadian rhythm schedule',
      'Flicker-free eye comfort diffuser lens (CRI > 95)',
      'Precision machined matte anodized aluminum arm'
    ],
    specs: [
      { key: 'Brightness', value: '1000 Lumens Max' },
      { key: 'Color Temp', value: '2200K - 6500K Tunable' },
      { key: 'Power', value: 'AC 100-240V Adapter' }
    ],
    price: 79.99,
    originalPrice: 99.99,
    discountPercent: 20,
    stock: 18,
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 18,
    isFeatured: true,
    isTrending: false,
    badge: 'New Arrival'
  },

  // 5. Accessories
  {
    name: 'Classic Chronograph Minimalist Watch',
    slug: 'classic-chronograph-minimalist-watch',
    brand: 'Nordic Heritage',
    category: 'Accessories',
    description: 'Scandinavian minimalist timepiece forged with 316L surgical stainless steel case, sapphire crystal glass, genuine Italian calfskin leather strap, and Japanese precision quartz movement.',
    features: [
      'Scratch-resistant Sapphire crystal dome lens',
      '5 ATM / 50 meters water resistance rating',
      'Italian full-grain quick-release leather strap',
      'Dual sub-dial 60-minute chronograph stopwatch'
    ],
    specs: [
      { key: 'Case Size', value: '40mm Diameter, 8.5mm Depth' },
      { key: 'Strap Width', value: '20mm' },
      { key: 'Glass', value: 'Anti-reflective Sapphire' }
    ],
    price: 185.00,
    originalPrice: 230.00,
    discountPercent: 20,
    stock: 25,
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 56,
    isFeatured: true,
    isTrending: false,
    badge: 'Best Seller'
  },
  {
    name: 'Full-Grain Leather Weekender Duffle Bag',
    slug: 'full-grain-leather-weekender-duffle-bag',
    brand: 'Voyager & Co.',
    category: 'Accessories',
    description: 'Handcrafted vegetable-tanned full-grain cowhide leather travel bag. Features dedicated ventilated shoe compartment, water-resistant twill lining, and antique solid brass YKK hardware.',
    features: [
      'Vegetable-tanned full-grain leather with rich natural patina',
      'Ventilated side compartment for footwear or laundry',
      'Padded sleeve fits up to 16-inch laptops',
      'Detachable ergonomic padded shoulder harness'
    ],
    specs: [
      { key: 'Capacity', value: '42 Liters (Carry-On Approved)' },
      { key: 'Dimensions', value: '21" L x 11.5" H x 10" W' },
      { key: 'Weight', value: '1.9 kg' }
    ],
    price: 219.00,
    originalPrice: 280.00,
    discountPercent: 22,
    stock: 7,
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 31,
    isFeatured: true,
    isTrending: true,
    badge: 'Premium'
  },

  // 6. Beauty & Skincare
  {
    name: 'Botanical Hyaluronic Moisture Shield Serum',
    slug: 'botanical-hyaluronic-moisture-shield-serum',
    brand: 'AuraBotanics',
    category: 'Beauty & Skincare',
    description: 'Clinically tested deep hydration formula packed with multi-molecular hyaluronic acid, niacinamide, and adaptogenic snow mushroom extract for radiant, bouncy skin barrier defense.',
    features: [
      'Multi-depth 4D Hyaluronic Acid hydration matrix',
      '5% Niacinamide to even skin tone & texture',
      '100% Vegan, Cruelty-Free, and Fragrance-Free',
      'Dermatologist tested and hypoallergenic'
    ],
    specs: [
      { key: 'Volume', value: '50 ml / 1.7 fl. oz.' },
      { key: 'Skin Type', value: 'All (Sensitive Friendly)' },
      { key: 'Usage', value: 'Daily AM & PM' }
    ],
    price: 44.00,
    originalPrice: 55.00,
    discountPercent: 20,
    stock: 30,
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-0a86a62d312c?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 28,
    isFeatured: true,
    isTrending: true,
    badge: 'Clean Beauty'
  },
  {
    name: 'Organic Restoring Botanical Face Oil',
    slug: 'organic-restoring-botanical-face-oil',
    brand: 'Lumiere Organics',
    category: 'Beauty & Skincare',
    description: 'Cold-pressed elixir featuring organic rosehip seed, golden jojoba, and squalane oils. Nourishes deeply overnight, restoring elasticity and sealing in essential hydration.',
    features: [
      'Pure cold-pressed organic nutrient complex',
      'Rich in natural Vitamin C and Omega 3-6-9',
      'Fast absorbing non-comedogenic lightweight texture',
      'Recyclable UV-protective amber glass bottle'
    ],
    specs: [
      { key: 'Volume', value: '30 ml / 1 fl. oz.' },
      { key: 'Certification', value: 'USDA Organic & ECOCERT' },
      { key: 'Origin', value: 'Made in France' }
    ],
    price: 52.00,
    originalPrice: 65.00,
    discountPercent: 20,
    stock: 0, // Out of stock demo!
    thumbnail: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 17,
    isFeatured: false,
    isTrending: false,
    badge: 'Sold Out'
  },

  // 7. Sports & Outdoors
  {
    name: 'AeroTherm Smart Insulated Vacuum Bottle',
    slug: 'aerotherm-smart-insulated-vacuum-bottle',
    brand: 'HydroPulse',
    category: 'Sports & Outdoors',
    description: 'Double-walled copper vacuum insulated 18/8 food-grade stainless steel bottle with digital temperature touch display on lid. Keeps beverages cold for 24 hours or piping hot for 12 hours.',
    features: [
      'Smart OLED touch lid showing exact liquid temperature',
      'Dual-copper vacuum insulation with sweat-free powder coat',
      'Leakproof magnetic sports chug cap included',
      'BPA-free, non-toxic, and dishwasher safe'
    ],
    specs: [
      { key: 'Capacity', value: '750 ml (25 oz)' },
      { key: 'Insulation', value: '24h Cold / 12h Hot' },
      { key: 'Material', value: 'Pro-grade 18/8 Stainless' }
    ],
    price: 38.00,
    originalPrice: 48.00,
    discountPercent: 21,
    stock: 42,
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.7,
    numReviews: 35,
    isFeatured: false,
    isTrending: true,
    badge: 'Active Gear'
  },
  {
    name: 'Ballistic Tactical Gym & Travel Duffle',
    slug: 'ballistic-tactical-gym-travel-duffle',
    brand: 'KevlarAthletics',
    category: 'Sports & Outdoors',
    description: 'Constructed from 1000D waterproof Cordura ballistic nylon. Equipped with antimicrobial wet kit pouch, tactical molle webbing, and padded hideaway backpack shoulder straps.',
    features: [
      '1000D indestructible water-repellent Cordura shell',
      'Separate waterproof zippered compartment for dirty gym wear',
      'Convertible 2-way carry: duffle handle or backpack harness',
      'Military-spec lockable YKK zippers'
    ],
    specs: [
      { key: 'Capacity', value: '38 Liters' },
      { key: 'Weight', value: '1.1 kg' },
      { key: 'Warranty', value: 'Lifetime Warranty' }
    ],
    price: 94.00,
    originalPrice: 120.00,
    discountPercent: 22,
    stock: 16,
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.8,
    numReviews: 21,
    isFeatured: true,
    isTrending: false,
    badge: 'Durable'
  },

  // 8. Workstation & Gaming
  {
    name: 'Merino Wool Felt Minimalist Desk Mat',
    slug: 'merino-wool-felt-minimalist-desk-mat',
    brand: 'GroveCraft',
    category: 'Workstation & Gaming',
    description: 'Precision cut from 4mm thick virgin Australian Merino wool felt with a natural anti-slip cork base. Dampens mechanical keystrokes while elevating your desk aesthetic with warm tactile comfort.',
    features: [
      '100% Virgin Australian Merino Wool felt (4mm density)',
      'Natural organic cork underlay prevents sliding',
      'Anti-fraying precision laser-trimmed border edges',
      'Naturally water-repellent and anti-static surface'
    ],
    specs: [
      { key: 'Dimensions', value: '900mm x 400mm (XL Setup)' },
      { key: 'Thickness', value: '4 mm' },
      { key: 'Base', value: 'Non-slip Natural Cork' }
    ],
    price: 49.00,
    originalPrice: 65.00,
    discountPercent: 25,
    stock: 24,
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    ratings: 4.9,
    numReviews: 44,
    isFeatured: true,
    isTrending: true,
    badge: 'Desk Setup'
  }
];

async function seed() {
  try {
    const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease_ecommerce';
    const localFallback = 'mongodb://127.0.0.1:27017/shopease_ecommerce';

    try {
      await mongoose.connect(primaryUri);
      console.log('[Seed] Connected to primary MongoDB URI.');
    } catch (connErr) {
      if (primaryUri !== localFallback) {
        console.warn(`\n⚠️  [Seed Warning] Could not authenticate with MongoDB Atlas: ${connErr.message}`);
        console.warn('   Your password or username in .env is incorrect in MongoDB Atlas.');
        console.warn('   Falling back to local MongoDB (mongodb://127.0.0.1:27017/shopease_ecommerce)...\n');
        await mongoose.connect(localFallback);
        console.log('[Seed] Connected to local MongoDB successfully.');
      } else {
        throw connErr;
      }
    }

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Inserted ${createdCategories.length} categories.`);

    // 2. Create Users (Admin, Customer, Supplier)
    // Admin user
    const adminUser = new User({
      name: 'Admin Store Manager',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2834'
    });
    await adminUser.save();

    // Supplier partner user
    const supplierUser = new User({
      name: 'Apex Global Supplies',
      email: 'supplier@apex.com',
      password: 'supplier123',
      role: 'supplier',
      phone: '+1 (555) 839-2041',
      supplierInfo: {
        companyName: 'Apex Global Supplies LLC',
        storeName: 'Apex Tech & Lifestyle Hardware',
        phone: '+1 (555) 839-2041',
        address: '500 Logistics Way, Suite 400, Austin, TX 78701',
        description: 'Verified premier distributor of high-performance acoustics, ergonomic gear, and lifestyle products.',
        isVerified: true
      }
    });
    await supplierUser.save();

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
    console.log('[Seed] Created Admin (admin@store.com), Supplier (supplier@apex.com), Customer (john@example.com).');

    // 3. Create Products with sample reviews & link to supplier
    const productsToInsert = sampleProducts.map((p, index) => {
      // Allocate half products to supplierUser, half to admin
      const isSupplierProduct = index % 2 === 0;
      return {
        ...p,
        supplier: isSupplierProduct ? supplierUser._id : adminUser._id,
        supplierName: isSupplierProduct ? supplierUser.supplierInfo.companyName : 'Shopease Official',
        reviews: [
          {
            user: customerUser._id,
            name: customerUser.name,
            rating: 5,
            comment: 'Absolutely exceeded my expectations! Premium build quality, sleek packaging, and fast delivery.',
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

    // 4. Update category product counts
    for (const cat of createdCategories) {
      const count = await Product.countDocuments({
        category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
      });
      cat.itemCount = count;
      await cat.save();
    }
    console.log('[Seed] Updated category product count metrics.');

    // 5. Create an initial sample order for the customer
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
    console.log('------------------------------------------------------------');
    console.log('Customer Account: john@example.com     / customer123');
    console.log('Admin Account:    admin@store.com      / admin123');
    console.log('Supplier Account: supplier@apex.com    / supplier123');
    console.log('------------------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seed();
