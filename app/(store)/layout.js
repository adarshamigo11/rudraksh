import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { getSettings } from '@/lib/settings';
import { serialize } from '@/lib/utils';
import { CartProvider } from '@/components/store/CartProvider';
import AnnouncementBar from '@/components/store/AnnouncementBar';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import CartDrawer from '@/components/store/CartDrawer';
import WhatsAppButton from '@/components/store/WhatsAppButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: { default: `${s.storeName} — ${s.tagline}`, template: `%s | ${s.storeName}` },
    description: s.tagline,
  };
}

export default async function StoreLayout({ children }) {
  const settings = await getSettings();
  let categories = [];
  try {
    await dbConnect();
    categories = serialize(await Category.find({ active: true }).sort({ order: 1, name: 1 }).select('name slug').lean());
  } catch {}

  return (
    <CartProvider settings={settings}>
      <AnnouncementBar items={settings.announcements} />
      <Header settings={settings} categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} categories={categories} />
      <CartDrawer />
      <WhatsAppButton number={settings.whatsapp} storeName={settings.storeName} />
    </CartProvider>
  );
}
