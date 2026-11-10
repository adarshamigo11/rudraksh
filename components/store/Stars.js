import { StarIcon } from './Icons';

export default function Stars({ value = 0, className = 'h-4 w-4' }) {
  return (
    <span className="inline-flex text-amber-500" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={className} filled={value >= n - 0.25} />
      ))}
    </span>
  );
}
