import { FilterBar } from "@/components/spaces/FilterBar";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { Pagination } from "@/components/spaces/Pagination";
import { ViewToggle } from "@/components/spaces/ViewToggle";
import connectToDatabase from "@/lib/db";
import { SpacesMapClient } from "@/components/spaces/SpacesMapClient";
import Space from "@/models/Space";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic"; // Ensure fresh data on each request with searchParams

async function getSpaces(searchParams: any, userId?: string) {
  await connectToDatabase();
  
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const city = searchParams.city || "";
  const minPrice = searchParams.minPrice || "";
  const maxPrice = searchParams.maxPrice || "";
  const minCapacity = searchParams.minCapacity || "";
  const sort = searchParams.sort || "createdAt_desc";
  const page = parseInt(searchParams.page || "1");
  const limit = 8; // 8 per page as per spec

  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (city) query.city = city;
  
  if (minPrice || maxPrice) {
    query.pricePerHour = {};
    if (minPrice) query.pricePerHour.$gte = Number(minPrice);
    if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
  }
  
  if (minCapacity) query.capacity = { $gte: Number(minCapacity) };

  let sortObj: any = { createdAt: -1 };
  if (sort === "price_asc") sortObj = { pricePerHour: 1 };
  else if (sort === "price_desc") sortObj = { pricePerHour: -1 };
  else if (sort === "rating_desc") sortObj = { rating: -1 };

  const skip = (page - 1) * limit;

  const [spaces, total] = await Promise.all([
    Space.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
    Space.countDocuments(query),
  ]);

  // Handle favorites if logged in
  let favoriteIds = new Set<string>();
  if (userId) {
    const db = (await connectToDatabase()).connection.db;
    const mongoose = await connectToDatabase();
    const objectId = mongoose.connection.base.Types.ObjectId.isValid(userId) ? new mongoose.connection.base.Types.ObjectId(userId) : null;
    const userQuery = { $or: [{ id: userId }, { _id: userId }, ...(objectId ? [{ _id: objectId }] : [])] };
    const user = await db.collection("user").findOne(userQuery);
    if (user?.favorites) {
      user.favorites.forEach((id: string) => favoriteIds.add(id));
    }
  }

  const serializedSpaces = spaces.map(space => ({
    ...space,
    _id: space._id.toString(),
    id: space._id.toString(),
    isFavorite: favoriteIds.has(space._id.toString())
  }));

  return {
    spaces: serializedSpaces,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function ExplorePage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("Explore");
  const session = await auth.api.getSession({ headers: await headers() });
  const view = searchParams.view || "grid";
  
  const { spaces, totalPages, page } = await getSpaces(searchParams, session?.user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--ink)] mb-4">{t('title')}</h1>
          <p className="text-xl text-[var(--ink)]/70 max-w-2xl">{t('subtitle')}</p>
        </div>
        <ViewToggle />
      </div>

      <FilterBar />

      {spaces.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[var(--line)] rounded-md">
          <h3 className="font-bold text-xl text-[var(--ink)] mb-2">{t('noSpaces')}</h3>
          <p className="text-[var(--ink)]/70">{t('tryAdjusting')}</p>
        </div>
      ) : (
        <>
          {view === "map" ? (
            <div className="h-[600px] w-full rounded-lg overflow-hidden border border-[var(--line)]">
              <SpacesMapClient spaces={spaces} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  id={space.id}
                  title={space.title}
                  shortDescription={space.shortDescription}
                  pricePerHour={space.pricePerHour}
                  rating={space.rating}
                  city={space.city}
                  location={space.location}
                  image={space.images?.[0] || ""}
                  isFavorite={space.isFavorite}
                />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
