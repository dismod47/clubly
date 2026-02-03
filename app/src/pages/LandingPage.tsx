import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { fetchSchools, type School } from '@/lib/admin-api';

export function LandingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchools() {
      const result = await fetchSchools();
      if (result.data) {
        setSchools(result.data);
      }
      setLoading(false);
    }
    loadSchools();
  }, []);
  return (
    <div className="pb-16">
      {/* Hero section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large friendly logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center shadow-xl">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.85 20 15.55 19.4 16.9 18.4"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="8" r="2.5" fill="white" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#111] mb-4">
            Welcome to <span className="text-[#FF6B35]">Clubly</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6F6F6F] max-w-2xl mx-auto mb-6">
            Discover events from student organizations at your university. 
            Never miss a meeting, social, or opportunity to get involved.
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 mb-12">
            <div className="flex items-center gap-2 text-[#6F6F6F]">
              <Calendar className="w-5 h-5 text-[#FF6B35]" />
              <span>Browse Events</span>
            </div>
            <div className="flex items-center gap-2 text-[#6F6F6F]">
              <Users className="w-5 h-5 text-[#FF6B35]" />
              <span>Student Orgs</span>
            </div>
            <div className="flex items-center gap-2 text-[#6F6F6F]">
              <MapPin className="w-5 h-5 text-[#FF6B35]" />
              <span>Campus Locations</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Schools section */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-[#111] mb-6 text-center">
            Select your school
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                Loading schools...
              </div>
            ) : schools.length > 0 ? (
              schools.map((school) => (
                <Link
                  key={school.id}
                  to={`/${school.slug}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#FF6B35]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* School badge */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: school.color || '#FF6B35' }}
                    >
                      {school.slug.toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#111] group-hover:text-[#FF6B35] transition-colors">
                        {school.name}
                      </h3>
                      <p className="text-sm text-[#6F6F6F] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {school.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No schools available yet. Check back soon!
              </div>
            )}
          </div>
          
          {/* Coming soon placeholder */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#6F6F6F]">
              More schools coming soon! 🎓
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
