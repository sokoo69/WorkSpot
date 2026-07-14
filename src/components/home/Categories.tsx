import Link from "next/link";
import { Users, Monitor, Presentation, Laptop } from "lucide-react";

export function Categories() {
  const categories = [
    {
      name: "Private Room",
      icon: Users,
      description: "Dedicated offices for teams to collaborate securely.",
      href: "/spaces?category=Private+Room"
    },
    {
      name: "Shared Desk",
      icon: Laptop,
      description: "Flexible hot-desks for independent professionals.",
      href: "/spaces?category=Shared+Desk"
    },
    {
      name: "Meeting Room",
      icon: Monitor,
      description: "Equipped rooms for client pitches and team syncs.",
      href: "/spaces?category=Meeting+Room"
    },
    {
      name: "Conference Hall",
      icon: Presentation,
      description: "Large spaces for workshops and corporate events.",
      href: "/spaces?category=Conference+Hall"
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-[var(--line)]">
      <div className="container mx-auto px-4">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-4 text-center">
          Space Categories
        </h2>
        <p className="text-[var(--ink)]/70 max-w-2xl mx-auto mb-12 text-center">
          Choose the right environment for your work style and requirements.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="group block p-6 border border-[var(--line)] rounded-md hover:border-[var(--forest)] bg-[var(--base)]/30 hover:bg-[var(--base)] transition-all h-full"
            >
              <category.icon className="w-10 h-10 text-[var(--forest)] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-[var(--ink)] mb-2">{category.name}</h3>
              <p className="text-sm text-[var(--ink)]/70 leading-relaxed">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
