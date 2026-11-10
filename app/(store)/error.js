'use client';

export default function Error({ reset }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="font-serif text-4xl font-bold text-maroon-900">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-stone-600">
        We could not load this page. If you are the site owner, check that <code>MONGODB_URI</code> is correct and
        your database allows connections from this server.
      </p>
      <button onClick={reset} className="btn btn-primary mt-6">Try again</button>
    </div>
  );
}
