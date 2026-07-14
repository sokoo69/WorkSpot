export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="font-display font-bold text-4xl text-[var(--ink)] mb-8">Privacy Policy</h1>
      
      <div className="prose prose-sm max-w-none text-[var(--ink)]/80 space-y-6">
        <p>Last updated: July 12, 2026</p>
        
        <h2 className="font-bold text-xl text-[var(--ink)]">1. Introduction</h2>
        <p>
          Welcome to WorkSpot. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you visit our website 
          and tell you about your privacy rights.
        </p>

        <h2 className="font-bold text-xl text-[var(--ink)]">2. The Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc pl-5">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
          <li><strong>Transaction Data</strong> includes details about payments and booking history.</li>
        </ul>

        <h2 className="font-bold text-xl text-[var(--ink)]">3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc pl-5">
          <li>To register you as a new user.</li>
          <li>To process and deliver your bookings.</li>
          <li>To manage our relationship with you.</li>
        </ul>

        <h2 className="font-bold text-xl text-[var(--ink)]">4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
          used or accessed in an unauthorized way, altered or disclosed.
        </p>

        <h2 className="font-bold text-xl text-[var(--ink)]">5. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, including any requests to exercise your legal rights, 
          please contact us at privacy@workspot.com.
        </p>
      </div>
    </div>
  );
}
