import ContactForm from '@/components/store/ContactForm';
import { getSettings } from '@/lib/settings';
import { digits } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact us' };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = digits(s.whatsapp);
  return (
    <div className="container-x max-w-4xl py-12">
      <h1 className="section-title mb-2 text-center">Contact us</h1>
      <p className="mb-10 text-center text-stone-600">Questions about a product or an order? We usually reply within a day.</p>
      <div className="grid gap-8 md:grid-cols-5">
        <div className="space-y-4 text-sm md:col-span-2">
          {wa && <p><b className="block text-stone-900">WhatsApp</b><a className="text-maroon-800 underline" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">+{wa}</a></p>}
          {s.phone && <p><b className="block text-stone-900">Phone</b>{s.phone}</p>}
          {s.email && <p><b className="block text-stone-900">Email</b>{s.email}</p>}
          {s.address && <p><b className="block text-stone-900">Address</b><span className="whitespace-pre-line">{s.address}</span></p>}
          {!wa && !s.phone && !s.email && !s.address && <p className="text-stone-500">Add your contact details from Admin → Settings.</p>}
        </div>
        <div className="md:col-span-3"><ContactForm /></div>
      </div>
    </div>
  );
}
