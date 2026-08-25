export default function Logo({ className = "" }) {
  return (
    <a href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="center-spot text-turf" aria-hidden="true" />
      <span className="font-display text-lg tracking-wordmark uppercase text-chalk">
        Onside
      </span>
    </a>
  );
}