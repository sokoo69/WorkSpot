import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: "FAQ — WorkSpot",
  description: "Frequently asked questions about booking co-working spaces on WorkSpot — covering reservations, cancellations, pricing, and more.",
};

const faqs = [
  {
    question: "How do I book a workspace on WorkSpot?",
    answer:
      "Browse spaces on the Explore page and filter by city, category, price, or capacity. Click View Details on any space you like, then use the booking widget on the right: pick your date, set a start and end time, and click Reserve. The total price is calculated live based on the hours and the hourly rate. Once you confirm, a booking is instantly created and visible under My Bookings.",
  },
  {
    question: "Do I need an account to browse spaces?",
    answer:
      "No — anyone can browse all space listings and view details, photos, amenities, and reviews without logging in. However, you need a free account to make a reservation, save a space to Favorites, or write a review. Registration takes under 30 seconds.",
  },
  {
    question: "How does pricing work? Are there any hidden fees?",
    answer:
      "WorkSpot charges purely on an hourly basis — what you see is what you pay. The price on each space card is the rate per hour in BDT. When you select a time range in the booking widget, your total is calculated as: hours x price per hour. There are no booking fees, service charges, or hidden surcharges added by WorkSpot.",
  },
  {
    question: "Can I cancel a reservation after booking?",
    answer:
      "Yes. You can cancel any confirmed booking that is still in the future from your My Bookings page. Click the Cancel button next to the booking and confirm. Bookings whose date and start time have already passed cannot be cancelled. Refund policies (if any) are set by the individual space owner — check the space description for details.",
  },
  {
    question: "How do I list my own space on WorkSpot?",
    answer:
      "Any registered user can become a space owner immediately — there is no separate approval process. Log in, click Add Space in the navigation bar, and fill in your space details: title, description, category, location, hourly price, capacity, amenities, and an optional photo URL. Once submitted, your listing goes live instantly and is visible on the Explore page. You can manage or remove your listings any time from the Manage Spaces page.",
  },
  {
    question: "How are reviews and ratings calculated?",
    answer:
      "Logged-in users can leave a star rating (1 to 5) and a written review on any space details page. The overall rating shown on the space card is a live average of all submitted reviews — it updates automatically every time a new review is added. Reviews are publicly visible to help other users make informed decisions.",
  },
  {
    question: "Is my payment and personal information secure?",
    answer:
      "WorkSpot uses Better Auth for secure, industry-standard authentication. Passwords are hashed and never stored in plain text. All connections use encrypted MongoDB Atlas endpoints. Currently, reservations are confirmed on the platform and actual payment is coordinated between the booker and the space owner. An integrated payment gateway is planned for a future release.",
  },
  {
    question: "What types of workspaces are available?",
    answer:
      "WorkSpot currently lists four categories: Private Rooms (dedicated, enclosed offices for 1-10 people), Shared Desks (individual hot-desk spots in open coworking floors), Meeting Rooms (fully equipped rooms for team meetings or client calls), and Conference Halls (large-capacity venues for seminars, workshops, and events). Use the category filter on the Explore page to narrow your search.",
  },
  {
    question: "What cities does WorkSpot currently operate in?",
    answer:
      "WorkSpot currently has listings in Dhaka, Chittagong, and Sylhet. We are actively working with space owners in Rajshahi, Khulna, and Barisal and expect to expand soon. If you own a space in an unlisted city, you are still welcome to list it — it will appear to users who search without a city filter.",
  },
  {
    question: "I am an admin — how do I manage users and spaces?",
    answer:
      "Admin accounts are created via a secure backend seed script and cannot be obtained through normal registration. Once logged in as an admin, you will see an Admin link in the navigation bar. From the Admin dashboard you can view site-wide stats, browse and delete any user account (which also removes all of that user's spaces), and delete any space listing regardless of who created it.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--ink)] mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-[var(--ink)]/70 text-lg max-w-2xl mx-auto">
          Everything you need to know about booking and listing workspaces on WorkSpot.
          Can&apos;t find an answer?{" "}
          <Link href="/contact" className="text-[var(--forest)] font-medium hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white border border-[var(--line)] rounded-md overflow-hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-bold text-[var(--ink)] hover:bg-[var(--base)] transition-colors list-none select-none">
              <span>{faq.question}</span>
              <ChevronDown className="w-5 h-5 text-[var(--forest)] shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 pt-2 text-[var(--ink)]/80 leading-relaxed border-t border-[var(--line)] text-sm">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-16 text-center p-8 bg-[var(--forest)]/5 border border-[var(--forest)]/20 rounded-md">
        <h2 className="font-bold text-xl text-[var(--ink)] mb-2">Still have questions?</h2>
        <p className="text-[var(--ink)]/70 mb-4">
          Our support team is happy to help with anything not covered above.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-[var(--forest)] text-white font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
