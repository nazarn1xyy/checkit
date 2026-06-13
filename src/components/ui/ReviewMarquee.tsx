'use client';

import React from 'react';

interface Review {
  text: string;
  author: string;
  role: string;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-[400px] bg-[#111111] border border-gray-800 rounded-2xl p-6 text-left shrink-0 whitespace-normal shadow-lg">
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, j) => (
          <svg key={j} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">&quot;{review.text}&quot;</p>
      <div className="flex items-center space-x-3 mt-auto">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/50 to-blue-600/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {review.author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{review.author}</p>
          <p className="text-xs text-gray-500">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

const reviews: Review[] = [
  { text: "Це найкращий спосіб перевірити ідею перед тим, як витрачати місяці на розробку. Рекомендую всім фаундерам!", author: "Максим Д.", role: "Засновник стартапу" },
  { text: "Ідеальний інструмент для швидкої валідації ідей на хакатоні чи перед пітчингом.", author: "Анна К.", role: "Product Manager" },
  { text: "Аналіз конкурентів та ризиків на рівні з професійними аналітиками. Дуже круто!", author: "Олег С.", role: "CEO" },
  { text: "Відмінна платформа! Допомогла відкинути три слабкі ідеї і сфокусуватись на одній сильній.", author: "Юлія В.", role: "Indie Hacker" },
];

export function ReviewMarquee() {
  // Duplicate reviews for seamless loop
  const doubled = [...reviews, ...reviews];

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
        {doubled.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>
    </div>
  );
}

export { reviews };
