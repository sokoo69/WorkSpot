"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "How do I book a workspace?",
      answer: "Simply search for a space, select your desired date and time on the details page, and click 'Reserve'. You'll need an account to complete the booking."
    },
    {
      question: "Are the prices hourly or daily?",
      answer: "All spaces on WorkSpot are listed with an hourly rate. The total price is calculated live based on your selected start and end times."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel any confirmed booking from your 'My Bookings' dashboard, provided the start time is still in the future."
    },
    {
      question: "How do I list my own space?",
      answer: "Create an account, go to 'Add Space', and fill in the details about your location, capacity, and pricing. It will be live instantly."
    },
    {
      question: "What amenities are included?",
      answer: "Amenities vary by space. Each listing clearly displays its available facilities such as WiFi, AC, Whiteboards, or Coffee in the Key Info section."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white border-b border-[var(--line)]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-[var(--ink)] mb-10 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border border-[var(--line)] rounded-md overflow-hidden transition-colors ${openIndex === index ? 'bg-[var(--base)]/30' : 'bg-white'}`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                onClick={() => toggle(index)}
              >
                <span className="font-bold text-[var(--ink)]">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[var(--forest)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--ink)]/50" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5 text-[var(--ink)]/70 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
