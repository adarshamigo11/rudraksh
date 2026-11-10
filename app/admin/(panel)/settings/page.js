import SettingsForm from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';
import { getSettings } from '@/lib/settings';
import { razorpayConfigured } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export default async function SettingsAdmin() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" sub="Store details, shipping, payments and contact information" />
      <p className={`mb-6 rounded-lg px-4 py-3 text-sm ${razorpayConfigured() ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
        {razorpayConfigured() ? 'Online payments (Razorpay) are enabled.' : 'Online payments are off. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables to enable UPI / card payments.'}
      </p>
      <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
    </>
  );
}
