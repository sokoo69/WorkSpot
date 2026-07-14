import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--ink)] mb-4">
          Contact Us
        </h1>
        <p className="text-[var(--ink)]/70 max-w-2xl mx-auto">
          Have a question or need assistance? We're here to help. Reach out to our team below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start gap-4 p-6 bg-[var(--base)] border border-[var(--line)] rounded-md">
            <Mail className="w-6 h-6 text-[var(--forest)] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-[var(--ink)] mb-1">Email</h3>
              <p className="text-[var(--ink)]/70 mb-2">For general inquiries and support.</p>
              <a href="mailto:support@workspot.com" className="font-mono font-bold text-[var(--forest)] hover:underline">
                support@workspot.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-[var(--base)] border border-[var(--line)] rounded-md">
            <Phone className="w-6 h-6 text-[var(--forest)] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-[var(--ink)] mb-1">Phone</h3>
              <p className="text-[var(--ink)]/70 mb-2">Mon-Fri from 9am to 6pm BST.</p>
              <a href="tel:+8801700000000" className="font-mono font-bold text-[var(--forest)] hover:underline">
                +880 1700 000 000
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-[var(--base)] border border-[var(--line)] rounded-md">
            <MapPin className="w-6 h-6 text-[var(--forest)] shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg text-[var(--ink)] mb-1">Office</h3>
              <p className="text-[var(--ink)]/70">
                WorkSpot HQ<br />
                Road 11, Banani<br />
                Dhaka 1213, Bangladesh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--line)] p-8 rounded-md shadow-sm">
          <h2 className="font-bold text-2xl text-[var(--ink)] mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Name</label>
              <Input type="text" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Email</label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">Message</label>
              <textarea 
                className="w-full h-32 rounded-md border border-[var(--line)] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)] resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <Button type="button" size="lg" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
