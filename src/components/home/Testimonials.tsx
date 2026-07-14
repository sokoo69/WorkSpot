import Image from "next/image";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Ahmed Rahman",
      role: "Freelance Developer",
      content: "WorkSpot made it incredibly easy to find a quiet desk in Gulshan. The booking process is seamless and the space was exactly as described.",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ahmed",
      rating: 5
    },
    {
      name: "Sadia Islam",
      role: "Startup Founder",
      content: "We book our weekly team syncs through this platform. The meeting rooms are top-notch and pricing is very transparent. Highly recommended.",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sadia",
      rating: 5
    },
    {
      name: "Tanvir Hasan",
      role: "Remote Consultant",
      content: "The best coworking discovery tool in Bangladesh. I travel between Dhaka and Chittagong often, and this app is a lifesaver.",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Tanvir",
      rating: 4
    }
  ];

  return (
    <section className="py-20 bg-[var(--base)] border-b border-[var(--line)]">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-4 text-center">
          What Our Users Say
        </h2>
        <p className="text-[var(--ink)]/70 max-w-2xl mx-auto mb-16 text-center">
          Hear from freelancers, founders, and teams who found their perfect workspace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 border border-[var(--line)] rounded-md flex flex-col h-full">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-[var(--clay)] text-[var(--clay)]' : 'text-[var(--line)]'}`} 
                  />
                ))}
              </div>
              <p className="text-[var(--ink)]/80 mb-6 flex-grow italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 bg-[var(--base)] rounded-full overflow-hidden border border-[var(--line)]">
                  <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--ink)] text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-[var(--ink)]/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
