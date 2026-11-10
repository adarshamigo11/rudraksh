import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center">
      <p className="font-serif text-7xl text-maroon-800">ॐ</p>
      <h1 className="mt-4 font-serif text-4xl font-bold text-maroon-900">Page not found</h1>
      <p className="mt-2 text-stone-600">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-saffron-600 px-6 py-3 text-sm font-semibold text-white hover:bg-saffron-700">Back to home</Link>
    </div>
  );
}
