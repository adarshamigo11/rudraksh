'use client';

export default function PrintButton() {
  return <button onClick={() => window.print()} className="btn btn-outline btn-sm print:hidden">🖨 Print</button>;
}
