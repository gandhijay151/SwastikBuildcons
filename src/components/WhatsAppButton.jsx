import { MessageCircle } from 'lucide-react';
import { company } from '../data/site';

export default function WhatsAppButton() {
  return (
    <a
      href={company.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <MessageCircle size={26} />
    </a>
  );
}
