/**
 * WorkSpot Seed Script
 * Usage: npm run seed
 *
 * Requirements:
 *  - .env.local must have MONGODB_URI
 *  - Next.js dev server must be running (npm run dev) OR set NEXT_URL env var
 *
 * What it does:
 *  1. Creates demo user (demo@workspot.com / Demo@1234) via Better Auth HTTP API
 *  2. Creates admin user (admin@workspot.com / Admin@1234) via Better Auth HTTP API
 *  3. Sets admin role via direct MongoDB update
 *  4. Seeds 16 realistic Space documents
 *  5. Seeds 8 sample Bookings for the demo user (spread across last 6 months)
 */

import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

// ── Load .env.local manually before anything else ────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const NEXT_URL = process.env.NEXT_URL || 'http://localhost:3000';

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not defined in .env.local');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function dateStr(n: number): string {
  return daysAgo(n).toISOString().split('T')[0];
}

/**
 * Creates a user via the running Better Auth HTTP endpoint.
 * Returns the cookie string from Set-Cookie so we can fetch the session.
 */
async function signUpViaHttp(
  name: string,
  email: string,
  password: string,
  phoneNumber: string
): Promise<string | null> {
  try {
    const res = await fetch(`${NEXT_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phoneNumber }),
    });
    const data = await res.json();
    if (data?.error || res.status >= 400) {
      // User probably already exists
      return null;
    }
    // Return Set-Cookie header for chaining if needed
    return res.headers.get('set-cookie');
  } catch (e: any) {
    console.warn(`  HTTP signup failed: ${e.message}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🚀  WorkSpot Seed Script');
  console.log('──────────────────────────────────────');

  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  console.log('✅  Connected to MongoDB Atlas');
  const db = client.db();

  // ── 1. Demo user ────────────────────────────────────────────────────────────
  let demoUser = await db.collection('user').findOne({ email: 'demo@workspot.com' });
  let demoUserId: string;

  if (!demoUser) {
    console.log('📝  Creating demo user via HTTP API...');
    await signUpViaHttp('Demo User', 'demo@workspot.com', 'Demo@1234', '01712345678');
    demoUser = await db.collection('user').findOne({ email: 'demo@workspot.com' });
    if (!demoUser) {
      console.error('❌  Could not create demo user. Is the dev server running at', NEXT_URL, '?');
      await client.close();
      process.exit(1);
    }
    console.log('✅  Demo user created');
  } else {
    console.log('ℹ️   Demo user already exists');
  }
  demoUserId = demoUser.id;

  // ── 2. Admin user ───────────────────────────────────────────────────────────
  let adminUser = await db.collection('user').findOne({ email: 'admin@workspot.com' });
  let adminUserId: string;

  if (!adminUser) {
    console.log('📝  Creating admin user via HTTP API...');
    await signUpViaHttp('Admin User', 'admin@workspot.com', 'Admin@1234', '01812345679');
    adminUser = await db.collection('user').findOne({ email: 'admin@workspot.com' });
    if (!adminUser) {
      console.error('❌  Could not create admin user. Is the dev server running at', NEXT_URL, '?');
      await client.close();
      process.exit(1);
    }
    console.log('✅  Admin user created');
  } else {
    console.log('ℹ️   Admin user already exists');
  }
  adminUserId = adminUser.id;

  // Always ensure admin role is set
  await db.collection('user').updateOne(
    { email: 'admin@workspot.com' },
    { $set: { role: 'admin' } }
  );
  console.log('✅  Admin role confirmed');

  // Ensure demo user has role "user" (not admin)
  await db.collection('user').updateOne(
    { email: 'demo@workspot.com' },
    { $set: { role: 'user' } }
  );

  // ── 3. Spaces ────────────────────────────────────────────────────────────────
  await db.collection('spaces').deleteMany({});
  console.log('🗑️   Cleared existing spaces');

  const spaces = [
    // DHAKA
    {
      ownerId: adminUserId,
      title: 'Gulshan Tech Hub Private Office',
      shortDescription: 'Premium private office in Gulshan 2, ideal for small tech startups.',
      fullDescription: 'A fully furnished private office in Gulshan 2 with 1Gbps internet, ergonomic chairs, a smart TV, and complimentary artisan coffee. 24/7 access with secure key-card entry. Ideal for teams needing a quiet, professional environment without long-term commitments.',
      category: 'Private Room',
      city: 'Dhaka',
      location: 'Gulshan 2',
      pricePerHour: 1500,
      capacity: 6,
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee', 'Whiteboard', 'Projector'],
      rating: 4.8,
      reviews: [
        { userName: 'Rafiq Ahmed', comment: 'Excellent, very professional.', rating: 5, createdAt: daysAgo(30) },
        { userName: 'Nadia Islam', comment: 'Fast internet, great location.', rating: 4.5, createdAt: daysAgo(15) },
      ],
      createdAt: daysAgo(120),
    },
    {
      ownerId: adminUserId,
      title: 'Banani Creator Studio Desk',
      shortDescription: 'Vibrant shared desk for creatives and freelancers in Banani.',
      fullDescription: 'Join a thriving creative community in Banani. Great city views, lots of natural light, 500Mbps WiFi, secure lockers, a coffee corner, and a breakout lounge. Perfect for designers, writers, and solo workers.',
      category: 'Shared Desk',
      city: 'Dhaka',
      location: 'Banani Road 11',
      pricePerHour: 300,
      capacity: 1,
      images: ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Lockers', 'Coffee'],
      rating: 4.5,
      reviews: [
        { userName: 'Tanvir Hossain', comment: 'Super cozy, great for focused work.', rating: 4.5, createdAt: daysAgo(45) },
      ],
      createdAt: daysAgo(90),
    },
    {
      ownerId: demoUserId,
      title: 'Dhanmondi Business Suite',
      shortDescription: 'Quiet private room in Dhanmondi 27 for meetings and deep work.',
      fullDescription: 'A soundproofed private business suite in Dhanmondi 27 for 2-4 people. Features natural lighting, a premium desk setup, high-speed internet, and access to shared kitchen facilities. Ideal for client calls and focused work sessions.',
      category: 'Private Room',
      city: 'Dhaka',
      location: 'Dhanmondi 27',
      pricePerHour: 800,
      capacity: 4,
      images: ['https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee', 'Whiteboard'],
      rating: 4.3,
      reviews: [],
      createdAt: daysAgo(60),
    },
    {
      ownerId: adminUserId,
      title: 'Uttara Corporate Meeting Room',
      shortDescription: 'Modern meeting room in Uttara for teams up to 10 people.',
      fullDescription: 'A sleek 10-person meeting room in Uttara Sector 7. Equipped with a 75" 4K display, video conferencing setup, high-speed internet, a whiteboard wall, and basement parking.',
      category: 'Meeting Room',
      city: 'Dhaka',
      location: 'Uttara Sector 7',
      pricePerHour: 1200,
      capacity: 10,
      images: ['https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Whiteboard', 'Parking'],
      rating: 4.6,
      reviews: [
        { userName: 'Maliha Chowdhury', comment: 'Perfect for our board presentation.', rating: 5, createdAt: daysAgo(10) },
      ],
      createdAt: daysAgo(75),
    },
    {
      ownerId: demoUserId,
      title: 'Mirpur Startup Shared Space',
      shortDescription: 'Affordable shared workspace for early-stage startups in Mirpur.',
      fullDescription: 'Budget-friendly, energetic shared workspace in Mirpur 10. Designed for founders and solo entrepreneurs. Regular networking events, fast WiFi, and coffee included. Flexible hourly pricing with no lock-in.',
      category: 'Shared Desk',
      city: 'Dhaka',
      location: 'Mirpur 10',
      pricePerHour: 200,
      capacity: 1,
      images: ['https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee'],
      rating: 4.0,
      reviews: [],
      createdAt: daysAgo(50),
    },
    {
      ownerId: adminUserId,
      title: 'Motijheel Grand Conference Hall',
      shortDescription: 'Large conference hall in the Dhaka business district for 80 attendees.',
      fullDescription: 'Premier event space in Motijheel C/A. Capacity for 80 people with a stage, PA system, dual projectors, live streaming capability, and full catering kitchen. Ideal for AGMs, product launches, and corporate training.',
      category: 'Conference Hall',
      city: 'Dhaka',
      location: 'Motijheel C/A',
      pricePerHour: 8000,
      capacity: 80,
      images: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Parking', 'Sound System', 'Whiteboard'],
      rating: 4.9,
      reviews: [
        { userName: 'Kamal Uddin', comment: 'Hosted our AGM here — flawless.', rating: 5, createdAt: daysAgo(5) },
      ],
      createdAt: daysAgo(100),
    },
    {
      ownerId: adminUserId,
      title: 'Dhaka North Rooftop Creative Studio',
      shortDescription: 'Unique rooftop creative workspace with panoramic views of Dhaka.',
      fullDescription: 'A rooftop studio in Tejgaon with 360° views. Perfect for creative agencies, photography, podcasts, and offsites. Includes podcast mic setup, green screen wall, lighting rigs, and a refreshment bar.',
      category: 'Private Room',
      city: 'Dhaka',
      location: 'Tejgaon Industrial Area',
      pricePerHour: 2500,
      capacity: 8,
      images: ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee', 'Projector'],
      rating: 4.9,
      reviews: [
        { userName: 'Sadia Akter', comment: 'Stunning space, perfect for our photoshoot.', rating: 5, createdAt: daysAgo(8) },
      ],
      createdAt: daysAgo(30),
    },
    {
      ownerId: adminUserId,
      title: 'Bashundhara Tech Coworking Floor',
      shortDescription: 'Open-plan coworking floor in Bashundhara with 50+ desks.',
      fullDescription: 'The largest coworking floor in Bashundhara R/A. 50+ workstations, phone booths, printing stations, a fully equipped kitchen, and a relaxation zone with bean bags. Community events every week.',
      category: 'Shared Desk',
      city: 'Dhaka',
      location: 'Bashundhara R/A',
      pricePerHour: 350,
      capacity: 1,
      images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee', 'Printer', 'Lockers'],
      rating: 4.4,
      reviews: [],
      createdAt: daysAgo(20),
    },
    // CHITTAGONG
    {
      ownerId: adminUserId,
      title: 'Agrabad Executive Boardroom',
      shortDescription: 'State-of-the-art boardroom for corporate clients in Chittagong.',
      fullDescription: 'Executive boardroom in Agrabad with a mahogany table for 12, 4K video conferencing, and a dedicated support team. In the heart of Chittagong\'s commercial hub with ample parking.',
      category: 'Meeting Room',
      city: 'Chittagong',
      location: 'Agrabad C/A',
      pricePerHour: 2000,
      capacity: 12,
      images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Whiteboard', 'Parking'],
      rating: 5.0,
      reviews: [
        { userName: 'Sumaiya Begum', comment: 'Best meeting room in Chittagong.', rating: 5, createdAt: daysAgo(20) },
      ],
      createdAt: daysAgo(80),
    },
    {
      ownerId: demoUserId,
      title: 'GEC Circle Freelancer Hub',
      shortDescription: 'Affordable shared desks for freelancers near GEC Circle, Chittagong.',
      fullDescription: 'A welcoming workspace near GEC Circle with high-speed internet, locker storage, printing facilities, and a community of local freelancers and remote workers.',
      category: 'Shared Desk',
      city: 'Chittagong',
      location: 'GEC Circle',
      pricePerHour: 250,
      capacity: 1,
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Lockers', 'Printer'],
      rating: 4.2,
      reviews: [],
      createdAt: daysAgo(40),
    },
    {
      ownerId: adminUserId,
      title: 'Nasirabad Tech Park Office',
      shortDescription: 'Private office pods for IT professionals in Nasirabad, Chittagong.',
      fullDescription: 'Designed for software developers: private pods with 1Gbps fiber, backup UPS, dual-monitor setups, and standing desk options in Nasirabad.',
      category: 'Private Room',
      city: 'Chittagong',
      location: 'Nasirabad',
      pricePerHour: 1000,
      capacity: 3,
      images: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Printer', 'Coffee'],
      rating: 4.7,
      reviews: [],
      createdAt: daysAgo(55),
    },
    {
      ownerId: demoUserId,
      title: 'Chittagong Port View Conference Hall',
      shortDescription: 'Grand conference hall with port views in Patenga for 40 attendees.',
      fullDescription: 'A conference hall in Patenga with views of Chittagong Port. Capacity for 40, with stage lighting, live streaming, translation booths, and full catering. Ideal for international delegations and corporate summits.',
      category: 'Conference Hall',
      city: 'Chittagong',
      location: 'Patenga',
      pricePerHour: 6000,
      capacity: 40,
      images: ['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Parking', 'Sound System'],
      rating: 4.5,
      reviews: [],
      createdAt: daysAgo(45),
    },
    // SYLHET
    {
      ownerId: adminUserId,
      title: 'Sylhet Innovation Conference Hall',
      shortDescription: 'Spacious conference hall for workshops and seminars in Zindabazar.',
      fullDescription: 'Premier conference hall in Zindabazar, Sylhet. Seats 50 with PA system, dual projectors, 4K display, and catering facilities. Perfect for workshops and large corporate events.',
      category: 'Conference Hall',
      city: 'Sylhet',
      location: 'Zindabazar',
      pricePerHour: 5000,
      capacity: 50,
      images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Parking', 'Sound System'],
      rating: 4.4,
      reviews: [],
      createdAt: daysAgo(70),
    },
    {
      ownerId: demoUserId,
      title: 'Sylhet Garden View Private Room',
      shortDescription: 'Peaceful private room with garden views for deep focused work.',
      fullDescription: 'A beautifully designed private room in Shahjalal Upashahar with a garden view. Perfect for writers and researchers. Includes artisan tea, organic snacks, and high-speed WiFi.',
      category: 'Private Room',
      city: 'Sylhet',
      location: 'Shahjalal Upashahar',
      pricePerHour: 600,
      capacity: 2,
      images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee'],
      rating: 4.6,
      reviews: [
        { userName: 'Arif Rahman', comment: 'Most peaceful workspace I have used. Loved it.', rating: 5, createdAt: daysAgo(12) },
      ],
      createdAt: daysAgo(35),
    },
    {
      ownerId: adminUserId,
      title: 'Sylhet Startup Collective Desk',
      shortDescription: 'Collaborative shared desk space for startups and entrepreneurs.',
      fullDescription: 'Sylhet\'s most vibrant startup community in Amberkhana. Monthly events, mentorship, and investor access. Shared desk with 24/7 access, locker storage, and well-stocked pantry.',
      category: 'Shared Desk',
      city: 'Sylhet',
      location: 'Amberkhana',
      pricePerHour: 180,
      capacity: 1,
      images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Coffee', 'Lockers'],
      rating: 4.3,
      reviews: [],
      createdAt: daysAgo(25),
    },
    {
      ownerId: demoUserId,
      title: 'Sylhet Riverside Meeting Room',
      shortDescription: 'Scenic 8-person meeting room with riverside views in Sylhet.',
      fullDescription: 'Overlooking the Surma River, this unique meeting room features modern AV equipment, a glass wall, and a dedicated host. One of the most memorable workspaces in Bangladesh.',
      category: 'Meeting Room',
      city: 'Sylhet',
      location: 'Surma River Bank',
      pricePerHour: 1800,
      capacity: 8,
      images: ['https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=800&q=80'],
      amenities: ['WiFi', 'AC', 'Projector', 'Whiteboard'],
      rating: 4.8,
      reviews: [],
      createdAt: daysAgo(15),
    },
  ];

  const spaceResult = await db.collection('spaces').insertMany(spaces);
  console.log(`✅  ${spaceResult.insertedCount} spaces seeded`);

  // ── 4. Bookings ──────────────────────────────────────────────────────────────
  await db.collection('bookings').deleteMany({ userId: demoUserId });
  console.log('🗑️   Cleared demo user bookings');

  const ids = Object.values(spaceResult.insertedIds).map((id) => id.toString());

  const bookings = [
    { spaceId: ids[0], userId: demoUserId, date: dateStr(150), startTime: '09:00', endTime: '13:00', hours: 4, totalPrice: 6000, status: 'confirmed', createdAt: daysAgo(150) },
    { spaceId: ids[1], userId: demoUserId, date: dateStr(120), startTime: '10:00', endTime: '14:00', hours: 4, totalPrice: 1200, status: 'confirmed', createdAt: daysAgo(120) },
    { spaceId: ids[8], userId: demoUserId, date: dateStr(90), startTime: '14:00', endTime: '18:00', hours: 4, totalPrice: 8000, status: 'confirmed', createdAt: daysAgo(90) },
    { spaceId: ids[3], userId: demoUserId, date: dateStr(60), startTime: '09:00', endTime: '11:00', hours: 2, totalPrice: 2400, status: 'confirmed', createdAt: daysAgo(60) },
    { spaceId: ids[0], userId: demoUserId, date: dateStr(30), startTime: '13:00', endTime: '17:00', hours: 4, totalPrice: 6000, status: 'confirmed', createdAt: daysAgo(30) },
    { spaceId: ids[1], userId: demoUserId, date: dateStr(10), startTime: '10:00', endTime: '12:00', hours: 2, totalPrice: 600, status: 'cancelled', createdAt: daysAgo(10) },
    // Future bookings (for Cancel button testing)
    { spaceId: ids[5], userId: demoUserId, date: dateStr(-10), startTime: '10:00', endTime: '18:00', hours: 8, totalPrice: 64000, status: 'confirmed', createdAt: new Date() },
    { spaceId: ids[3], userId: demoUserId, date: dateStr(-5), startTime: '09:00', endTime: '11:00', hours: 2, totalPrice: 2400, status: 'confirmed', createdAt: new Date() },
  ];

  const bookingResult = await db.collection('bookings').insertMany(bookings);
  console.log(`✅  ${bookingResult.insertedCount} sample bookings seeded`);

  await client.close();

  console.log('\n🎉  Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Demo user:   demo@workspot.com  / Demo@1234');
  console.log('  Admin user:  admin@workspot.com / Admin@1234');
  console.log('─────────────────────────────────────────');
}

run().catch(async (e) => {
  console.error('\n❌  Seed failed:', e.message || e);
  process.exit(1);
});
