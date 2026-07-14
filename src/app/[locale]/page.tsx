import { Hero } from "@/components/home/Hero";
import { FeaturedSpaces } from "@/components/home/FeaturedSpaces";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Categories } from "@/components/home/Categories";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";
import { Newsletter } from "@/components/home/Newsletter";
import connectToDatabase from "@/lib/db";
import Space from "@/models/Space";

async function getHomePageData() {
  await connectToDatabase();
  
  // Get 4 featured spaces (we can just take 4 highly rated or latest ones)
  const spaces = await Space.find({}).sort({ rating: -1, createdAt: -1 }).limit(4).lean();
  
  // Serialize IDs
  const featuredSpaces = spaces.map(space => ({
    ...space,
    _id: space._id.toString(),
    id: space._id.toString(),
  }));

  // Get Stats
  const totalSpaces = await Space.countDocuments();
  const citiesObj = await Space.distinct("city");
  
  // To count total owners, we can count distinct ownerId in Spaces
  const uniqueOwners = await Space.distinct("ownerId");

  return {
    featuredSpaces,
    stats: {
      spaces: totalSpaces > 0 ? totalSpaces : 20, // fallback for empty states
      cities: citiesObj.length > 0 ? citiesObj.length : 3,
      owners: uniqueOwners.length > 0 ? uniqueOwners.length : 10,
    }
  };
}

import { RecentlyViewed } from "@/components/home/RecentlyViewed";

export default async function Home() {
  const { featuredSpaces, stats } = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeaturedSpaces spaces={featuredSpaces} />
      <RecentlyViewed />
      <HowItWorks />
      <Categories />
      <Stats stats={stats} />
      <Testimonials />
      <FAQSection />
      <Newsletter />
    </div>
  );
}
