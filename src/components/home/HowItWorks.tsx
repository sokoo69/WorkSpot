import { Search, CalendarCheck, Briefcase } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search",
      description: "Browse verified workspaces across Dhaka, Chittagong, and Sylhet. Filter by category, price, and amenities."
    },
    {
      icon: CalendarCheck,
      title: "Reserve",
      description: "Select your desired date and time. Confirm your booking instantly with live availability."
    },
    {
      icon: Briefcase,
      title: "Arrive",
      description: "Check in at your reserved space and start working immediately in a professional environment."
    }
  ];

  return (
    <section className="py-20 bg-[var(--base)] border-b border-[var(--line)]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-4">
          How It Works
        </h2>
        <p className="text-[var(--ink)]/70 max-w-2xl mx-auto mb-16">
          Book your ideal workspace in three simple steps. No hidden fees, no complicated contracts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-[1px] bg-[var(--line)] -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white border border-[var(--forest)] rounded-md flex items-center justify-center mb-6 shadow-sm">
                <step.icon className="w-8 h-8 text-[var(--forest)]" />
              </div>
              <h3 className="font-bold text-xl text-[var(--ink)] mb-3">{step.title}</h3>
              <p className="text-[var(--ink)]/70 leading-relaxed text-sm max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
