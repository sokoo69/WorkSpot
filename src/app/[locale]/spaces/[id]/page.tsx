import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MapPin, Users, Star, CheckCircle, CheckCircle2 } from "lucide-react";
import connectToDatabase from "@/lib/db";
import mongoose from "mongoose";
import Space from "@/models/Space";
import { BookingWidget } from "@/components/spaces/BookingWidget";
import { Badge } from "@/components/ui/Badge";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { FavoriteButton } from "@/components/spaces/FavoriteButton";
import { ReviewForm } from "@/components/spaces/ReviewForm";
import { RatingBreakdown } from "@/components/spaces/RatingBreakdown";
import { AvailabilityCalendar } from "@/components/spaces/AvailabilityCalendar";
import { RecentViewTracker } from "@/components/spaces/RecentViewTracker";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

async function getSpaceData(id: string) {
  try {
    await connectToDatabase();
    // Increment view count and get updated space
    const space = await Space.findByIdAndUpdate(id, { $inc: { views: 1 } }, { returnDocument: 'after' }).lean();
    if (!space) return null;

    // Get owner's other spaces and KYC status to calculate verified status
    const db = (await connectToDatabase()).connection.db;
    const ownerIdStr = space.ownerId;
    const ownerObjectId = mongoose.Types.ObjectId.isValid(ownerIdStr) ? new mongoose.Types.ObjectId(ownerIdStr) : null;
    const ownerQuery = { $or: [{ id: ownerIdStr }, { _id: ownerIdStr }, ...(ownerObjectId ? [{ _id: ownerObjectId }] : [])] };
    const ownerDoc = db ? await db.collection("user").findOne(ownerQuery) : null;
    
    const ownerSpaces = await Space.find({ ownerId: space.ownerId }).select("rating").lean();
    const isVerifiedOwner = ownerDoc?.isVerifiedOwner || ownerSpaces.length >= 3 || 
      (ownerSpaces.length > 0 && ownerSpaces.reduce((acc, s) => acc + (s.rating || 0), 0) / ownerSpaces.length >= 4.5);

    // Get related spaces
    const relatedSpaces = await Space.find({
      _id: { $ne: id },
      $or: [{ category: space.category }, { city: space.city }]
    }).limit(4).lean();

    const result = {
      space: {
        ...space,
        _id: space._id.toString(),
        id: space._id.toString(),
      },
      relatedSpaces: relatedSpaces.map(s => ({
        ...s,
        _id: s._id.toString(),
        id: s._id.toString(),
      })),
      isFavorite: false,
      isVerifiedOwner
    };

    // If user is logged in, check if they favorited it
    try {
      const sessionRes = await auth.api.getSession({
        headers: await headers()
      });
      if (sessionRes?.user) {
        const mongooseInstance = await connectToDatabase();
        const db = mongooseInstance.connection.db;
        if (db) {
          const sid = sessionRes.user.id;
          const sObjectId = mongoose.Types.ObjectId.isValid(sid) ? new mongoose.Types.ObjectId(sid) : null;
          const sQuery = { $or: [{ id: sid }, { _id: sid }, ...(sObjectId ? [{ _id: sObjectId }] : [])] };
          const userDoc = await db.collection("user").findOne(sQuery);
          if (userDoc?.favorites?.includes(id)) {
            result.isFavorite = true;
          }
        }
      }
    } catch(e) {
      // ignore
    }

    return result;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const data = await getSpaceData(params.id);
  
  if (!data) {
    return { title: "Space Not Found - WorkSpot" };
  }
  
  return {
    title: `${data.space.title} - WorkSpot`,
    description: data.space.shortDescription,
    openGraph: {
      title: `${data.space.title} - WorkSpot`,
      description: data.space.shortDescription,
      images: data.space.images && data.space.images.length > 0 ? [{ url: data.space.images[0] }] : [],
    }
  };
}

export default async function SpaceDetailsPage(props: { params: Promise<{ id: string, locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations("SpaceDetails");
  const data = await getSpaceData(params.id);
  
  if (!data) {
    notFound();
  }

  const { space, relatedSpaces } = data;
  const referenceCode = `#${space.city.substring(0, 3).toUpperCase()}-${space.id.substring(space.id.length - 4).toUpperCase()}`;

  return (
    <div className="bg-white">
      <RecentViewTracker 
        id={space.id} 
        title={space.title} 
        image={space.images?.[0] || ""} 
        pricePerHour={space.pricePerHour} 
      />
      {/* Image Header */}
      <div className="w-full h-[50vh] min-h-[400px] relative bg-[var(--line)]">
        {space.images && space.images.length > 0 ? (
          <Image
            src={space.images[0]}
            alt={space.title}
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink)]/50">
            No Image
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{space.category}</Badge>
              <div className="font-mono text-xs font-medium text-[var(--ink)]/60 bg-[var(--base)] px-2 py-1 rounded-sm border border-[var(--line)]">
                {referenceCode}
              </div>
            </div>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--ink)] mb-2">
                  {space.title}
                </h1>
                {data.isVerifiedOwner && (
                  <Badge variant="outline" className="bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Owner
                  </Badge>
                )}
              </div>
              <FavoriteButton spaceId={space.id} initialFavorite={data.isFavorite} />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ink)]/70 mb-8 border-b border-[var(--line)] pb-8">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {space.location}, {space.city}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {t('capacity', { count: space.capacity })}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[var(--clay)] text-[var(--clay)]" />
                {space.rating.toFixed(1)} ({space.reviews?.length || 0} {t('reviews').toLowerCase()})
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[var(--ink)]">{t('views', { count: space.views || 1 })}</span>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-bold text-2xl text-[var(--ink)] mb-4">{t('overview')}</h2>
              <div className="prose prose-sm max-w-none text-[var(--ink)]/80 leading-relaxed whitespace-pre-wrap">
                {space.fullDescription}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-bold text-2xl text-[var(--ink)] mb-4">{t('amenities')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {space.amenities?.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-[var(--ink)]/80">
                    <CheckCircle2 className="w-4 h-4 text-[var(--forest)]" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mb-12">
              <h2 className="font-bold text-2xl text-[var(--ink)] mb-6">{t('reviews')}</h2>
              <RatingBreakdown reviews={space.reviews || []} />
              {space.reviews && space.reviews.length > 0 ? (
                <div className="space-y-6">
                  {space.reviews.map((review: any, idx: number) => (
                    <div key={idx} className="border border-[var(--line)] rounded-md p-6 bg-[var(--base)]/30">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-[var(--clay)] text-[var(--clay)]' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[var(--ink)]/80 italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--ink)]/60">{t('noReviews')}</p>
              )}
              <ReviewForm spaceId={space.id} />
            </div>
          </div>

          {/* Sidebar / Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <BookingWidget spaceId={space.id} pricePerHour={space.pricePerHour} />
              <AvailabilityCalendar spaceId={space.id} />
            </div>
          </div>

        </div>

        {/* Related Spaces */}
        {relatedSpaces.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[var(--line)]">
            <h2 className="font-display font-bold text-3xl text-[var(--ink)] mb-8">
              {t('similarSpaces')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedSpaces.map((s: any) => (
                <SpaceCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  shortDescription={s.shortDescription}
                  pricePerHour={s.pricePerHour}
                  rating={s.rating}
                  city={s.city}
                  location={s.location}
                  image={s.images?.[0] || ""}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
