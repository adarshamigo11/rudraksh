import { WhatsappIcon } from './Icons';
import { digits } from '@/lib/utils';

export default function WhatsAppButton({ number, storeName }) {
  const n = digits(number);
  if (!n) return null;
  const text = encodeURIComponent(`Namaste ${storeName}, I need help with...`);
  return (
    <a
      href={`https://wa.me/${n}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 md:bottom-6"
    >
      <WhatsappIcon />
    </a>
  );
}
