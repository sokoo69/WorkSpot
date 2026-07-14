import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-[var(--base)] pt-12 pb-6 border-t border-[var(--line)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-display font-bold text-2xl tracking-tight text-[var(--base)] block mb-4">
              WorkSpot.
            </Link>
            <p className="text-sm text-[var(--base)]/70 leading-relaxed mb-6">
              The premier co-working space booking platform in Bangladesh. Find your perfect workspace today.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase">Explore</h4>
            <ul className="space-y-2 text-sm text-[var(--base)]/70">
              <li><Link href="/spaces" className="hover:text-white transition-colors">Find a Space</Link></li>
              <li><Link href="/spaces?category=Private+Room" className="hover:text-white transition-colors">Private Rooms</Link></li>
              <li><Link href="/spaces?category=Meeting+Room" className="hover:text-white transition-colors">Meeting Rooms</Link></li>
              <li><Link href="/spaces?category=Shared+Desk" className="hover:text-white transition-colors">Shared Desks</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--base)]/70">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase">Contact</h4>
            <ul className="space-y-3 text-sm text-[var(--base)]/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--clay)]" />
                <span>Gulshan, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--clay)]" />
                <span>support@workspot.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[var(--clay)]" />
                <span>+880 1234-567890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--base)]/20 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[var(--base)]/50">
          <p>&copy; {new Date().getFullYear()} WorkSpot. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="https://facebook.com" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="https://twitter.com" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="https://linkedin.com" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
