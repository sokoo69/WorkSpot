import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="bg-[var(--base)] py-20 border-b border-[var(--line)] text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--ink)] mb-4">
            About WorkSpot
          </h1>
          <p className="text-[var(--ink)]/70 max-w-2xl mx-auto text-lg">
            Redefining how professionals find and book workspaces in Bangladesh.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="prose prose-lg max-w-none text-[var(--ink)]/80">
          <p className="mb-6">
            WorkSpot was founded with a simple mission: to connect modern professionals, freelancers, and growing teams with the perfect workspace when and where they need it. 
          </p>
          <p className="mb-6">
            In today's dynamic work environment, flexibility is key. Whether you need a quiet desk for focused work in Dhaka, a professional meeting room to pitch a client in Chittagong, or a large conference hall for a corporate event in Sylhet, WorkSpot provides instant access to verified spaces with transparent hourly pricing.
          </p>
          
          <h2 className="font-display font-bold text-2xl text-[var(--ink)] mt-12 mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 not-prose">
            <div className="p-6 border border-[var(--line)] rounded-md bg-[var(--base)]/30">
              <h3 className="font-bold text-lg text-[var(--ink)] mb-2">Transparency</h3>
              <p className="text-sm text-[var(--ink)]/70">No hidden fees, no complicated long-term leases. What you see is exactly what you get.</p>
            </div>
            <div className="p-6 border border-[var(--line)] rounded-md bg-[var(--base)]/30">
              <h3 className="font-bold text-lg text-[var(--ink)] mb-2">Quality First</h3>
              <p className="text-sm text-[var(--ink)]/70">Every space listed on our platform is verified to ensure it meets our standards for professional environments.</p>
            </div>
            <div className="p-6 border border-[var(--line)] rounded-md bg-[var(--base)]/30">
              <h3 className="font-bold text-lg text-[var(--ink)] mb-2">Empowering Owners</h3>
              <p className="text-sm text-[var(--ink)]/70">We help property owners monetize their underutilized assets by connecting them with professionals in need.</p>
            </div>
            <div className="p-6 border border-[var(--line)] rounded-md bg-[var(--base)]/30">
              <h3 className="font-bold text-lg text-[var(--ink)] mb-2">Seamless Experience</h3>
              <p className="text-sm text-[var(--ink)]/70">From discovery to booking to check-in, we focus on making the process as smooth as possible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
