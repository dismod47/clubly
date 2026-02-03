import { Link } from 'react-router-dom';

export function ClublyLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
      {/* Friendly orange logo with warm rounded design */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center shadow-md">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized "C" with a friendly dot */}
          <path
            d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.85 20 15.55 19.4 16.9 18.4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="18" cy="8" r="2.5" fill="white" />
        </svg>
      </div>
      <span className="text-xl font-bold text-[#111] tracking-tight">clubly</span>
    </Link>
  );
}
