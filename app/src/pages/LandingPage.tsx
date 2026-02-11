import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { MapPin, Calendar, Users, Sparkles, ArrowRight, Play, Zap, Clock, ChevronRight, Video, Filter, Bell } from 'lucide-react';
import { fetchSchools, type School } from '@/lib/admin-api';
import { fetchEvents } from '@/lib/events-api';
import type { OrgEvent } from '@/types';
import { categoryColors, categoryEmojis } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const forClubsRef = useRef<HTMLDivElement>(null);
  const schoolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const [schoolsResult, eventsData] = await Promise.all([
        fetchSchools(),
        fetchEvents()
      ]);
      if (schoolsResult.data) {
        setSchools(schoolsResult.data);
      }
      setEvents(eventsData.slice(0, 10)); // Get first 10 events for ticker
      setLoading(false);
    }
    loadData();
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (!heroTextRef.current) return;

    const ctx = gsap.context(() => {
      // Animate hero text elements
      gsap.fromTo(
        '.hero-line',
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3
        }
      );

      // Animate floating shapes
      gsap.to('.floating-shape', {
        y: -20,
        duration: 2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3
      });

      // Animate gradient orbs
      gsap.to('.gradient-orb', {
        scale: 1.1,
        duration: 3,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // How It Works cards - stagger reveal
      gsap.fromTo(
        '.how-card',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 75%',
            onEnter: () => {
              // Card 1: Calendar page flip animation
              gsap.fromTo('.calendar-page',
                { rotateX: -90, transformOrigin: 'top center' },
                { rotateX: 0, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' }
              );
              gsap.fromTo('.sparkle-1',
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.5, delay: 0.5, ease: 'back.out(2)' }
              );

              // Card 2: Heart pulse animation
              gsap.fromTo('.heart-main',
                { scale: 0.5, transformOrigin: 'center center' },
                { scale: 1, duration: 0.6, delay: 0.5, ease: 'elastic.out(1, 0.5)' }
              );
              gsap.fromTo('.heart-orbit-1',
                { x: 30, y: 30, opacity: 0 },
                { x: 0, y: 0, opacity: 0.8, duration: 0.5, delay: 0.7, ease: 'power2.out' }
              );
              gsap.fromTo('.heart-orbit-2',
                { x: -30, y: 30, opacity: 0 },
                { x: 0, y: 0, opacity: 0.8, duration: 0.5, delay: 0.8, ease: 'power2.out' }
              );
              gsap.fromTo('.heart-orbit-3',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 0.8, duration: 0.5, delay: 0.9, ease: 'power2.out' }
              );

              // Card 3: Pin drop + confetti burst
              gsap.fromTo('.pin-drop',
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, delay: 0.7, ease: 'bounce.out' }
              );
              // Confetti burst
              gsap.fromTo('.confetti-1', { scale: 0, x: 40, y: 40 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 0.9, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-2', { scale: 0, x: -30, y: 35 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 0.95, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-3', { scale: 0, x: 45, y: 0 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 1.0, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-4', { scale: 0, x: -35, y: 5 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 1.05, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-5', { scale: 0, x: 30, y: -30 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 1.1, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-6', { scale: 0, x: -25, y: -25 }, { scale: 1, x: 0, y: 0, duration: 0.4, delay: 1.15, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-7', { scale: 0, y: 45 }, { scale: 1, y: 0, duration: 0.4, delay: 1.2, ease: 'back.out(2)' });
              gsap.fromTo('.confetti-8', { scale: 0, y: 50 }, { scale: 1, y: 0, duration: 0.4, delay: 1.25, ease: 'back.out(2)' });
            }
          }
        }
      );

      // Feature sections
      gsap.fromTo(
        '.feature-item',
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 70%',
          }
        }
      );

      // For Clubs section
      gsap.fromTo(
        '.clubs-content',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: forClubsRef.current,
            start: 'top 70%',
          }
        }
      );

      // School cards
      gsap.fromTo(
        '.school-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: schoolsRef.current,
            start: 'top 80%',
          }
        }
      );
    });

    return () => ctx.revert();
  }, [loading]);

  return (
    <div className="overflow-hidden">
      {/* ============ ABOVE THE FOLD: HERO + SLIDER ============ */}
      <section
        ref={heroRef}
        className="relative h-[calc(100vh-60px)] flex flex-col justify-between py-6 overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F6F6F2] via-[#FFF5F0] to-[#F0F7FF]" />

        {/* Floating gradient orbs */}
        <div className="gradient-orb absolute top-10 left-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-uh-orange/20 to-uh-pink/20 blur-3xl" />
        <div className="gradient-orb absolute top-16 right-[10%] w-56 h-56 rounded-full bg-gradient-to-br from-uh-purple/20 to-uh-blue/20 blur-3xl" />
        <div className="gradient-orb absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-gradient-to-br from-uh-teal/10 to-uh-green/10 blur-3xl" />

        {/* Floating decorative shapes */}
        <div className="floating-shape absolute top-20 right-[18%] w-12 h-12 rounded-2xl bg-gradient-to-br from-uh-orange to-uh-pink rotate-12 opacity-60" />
        <div className="floating-shape absolute top-28 left-[12%] w-10 h-10 rounded-full bg-gradient-to-br from-uh-purple to-uh-blue opacity-50" />
        <div className="floating-shape absolute top-16 right-[6%] w-14 h-14 rounded-3xl bg-gradient-to-br from-uh-teal to-uh-green rotate-45 opacity-40" />

        {/* Hero content - centered in available space */}
        <div ref={heroTextRef} className="relative z-10 flex-1 flex flex-col justify-center text-center px-4 max-w-5xl mx-auto w-full">
          {/* Main headline */}
          <h1 className="hero-line text-4xl md:text-6xl lg:text-7xl font-bold text-[#111] mb-4 leading-[1.1]">
            Find What's Happening at{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-uh-orange via-uh-pink to-uh-purple bg-clip-text text-transparent">
                University of Houston
              </span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 400 12" fill="none">
                <path d="M2 8 Q100 2, 200 8 T398 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="hero-line text-xl md:text-2xl text-[#6F6F6F] max-w-2xl mx-auto mb-5 leading-relaxed">
            Discover events from student organizations — all in one place.
          </p>

          {/* Student-made disclaimer badge */}
          <div className="hero-line inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 mb-6 mx-auto">
            <Users className="w-4 h-4 text-uh-orange" />
            <span className="text-sm md:text-base text-gray-600">
              Not affiliated with UH • <span className="font-medium text-[#111]">Made by students, for students</span>
            </span>
          </div>

          {/* CTA buttons */}
          <div className="hero-line flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/uh"
              className="group px-10 py-5 rounded-full bg-gradient-to-r from-uh-orange to-uh-pink text-white font-semibold text-xl shadow-lg shadow-uh-orange/25 hover:shadow-xl hover:shadow-uh-orange/30 hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              Explore Events
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setIsVideoOpen(true)}
              className="group px-10 py-5 rounded-full bg-white/80 backdrop-blur-sm text-[#111] font-semibold text-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <Play className="w-6 h-6 text-uh-orange" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* ============ EVENTS SLIDER ============ */}
        {events.length > 0 && (
          <div className="relative z-10 flex-shrink-0 -mt-4">
            {/* Slider header */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-uh-orange font-semibold text-lg shadow-sm">
                <Zap className="w-5 h-5" />
                Student Org Events at UH
              </span>
            </div>

            {/* Infinite slider container */}
            <div className="slider-container">
              <div className="flex gap-4 animate-marquee-infinite">
                {/* Triple the events for seamless infinite loop */}
                {[...events, ...events, ...events].map((event, i) => {
                  const bgColor = categoryColors[event.category];
                  const emoji = categoryEmojis[event.category];

                  return (
                    <div
                      key={`${event.id}-${i}`}
                      className="flex-shrink-0 w-[340px] card-elevated p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                    >
                      {/* Header: Category badge + Org */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: bgColor }}
                        >
                          {emoji}
                        </span>
                        <span className="text-base font-medium text-[#6F6F6F] flex-1 truncate">
                          {event.organization}
                        </span>
                        <span
                          className="px-3 py-1.5 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: bgColor }}
                        >
                          {event.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-lg leading-tight text-[#111] mb-3 line-clamp-1">
                        {event.title}
                      </h3>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-base text-[#6F6F6F]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {event.startTime}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin size={16} />
                          {event.location.split(',')[0]}
                        </span>
                        {event.videoUrl && (
                          <span className="flex items-center text-uh-purple">
                            <Video size={16} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section ref={howItWorksRef} className="py-32 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#111]">
              How It Works
            </h2>
          </div>

          {/* Video */}
          <div className="mb-16">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-uh-orange/20 to-uh-purple/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <video
                  src="/how-it-works.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full aspect-square object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {/* Card 1: Browse Events - Calendar Animation */}
            <div className="how-card group relative bg-gradient-to-br from-orange-50 to-white rounded-[2rem] p-8 border border-orange-100/50 hover:border-transparent hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                {/* Animated Calendar Icon */}
                <div className="how-icon-1 relative w-32 h-32 mb-8">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    {/* Calendar base */}
                    <rect x="15" y="25" width="90" height="80" rx="12" fill="url(#grad-orange)" />
                    {/* Calendar header */}
                    <rect x="15" y="25" width="90" height="24" rx="12" fill="#FF6B35" />
                    <rect x="15" y="37" width="90" height="12" fill="#FF6B35" />
                    {/* Calendar rings */}
                    <rect x="35" y="18" width="8" height="20" rx="4" fill="#E55A2B" />
                    <rect x="77" y="18" width="8" height="20" rx="4" fill="#E55A2B" />
                    {/* Calendar page (animated) */}
                    <g className="calendar-page">
                      <rect x="25" y="55" width="70" height="40" rx="4" fill="white" />
                      {/* Grid dots */}
                      <circle cx="40" cy="70" r="4" fill="#FFD6A5" />
                      <circle cx="60" cy="70" r="4" fill="#F3E7FF" />
                      <circle cx="80" cy="70" r="4" fill="#B9E7F5" />
                      <circle cx="40" cy="85" r="4" fill="#D6F5E3" />
                      <circle cx="60" cy="85" r="6" fill="#FF6B35" />
                      <circle cx="80" cy="85" r="4" fill="#FFE4E1" />
                    </g>
                    <defs>
                      <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF5F0" />
                        <stop offset="100%" stopColor="#FFE8DD" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Floating sparkles */}
                  <div className="sparkle-1 absolute -top-2 -right-2 w-6 h-6 text-yellow-400">
                    <Sparkles className="w-full h-full" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111]">Browse Events</h3>
              </div>
            </div>

            {/* Card 2: Find Your Vibe - Crowd/Hearts Animation */}
            <div className="how-card group relative bg-gradient-to-br from-purple-50 to-white rounded-[2rem] p-8 border border-purple-100/50 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                {/* Animated Hearts/People Icon */}
                <div className="how-icon-2 relative w-32 h-32 mb-8">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    {/* Center heart */}
                    <path className="heart-main" d="M60 95 C35 70, 20 50, 35 35 C50 20, 60 35, 60 35 C60 35, 70 20, 85 35 C100 50, 85 70, 60 95Z" fill="url(#grad-purple)" />
                    {/* Orbiting hearts */}
                    <g className="orbit-hearts">
                      <path className="heart-orbit-1" d="M25 40 C18 33, 12 28, 18 22 C24 16, 28 22, 28 22 C28 22, 32 16, 38 22 C44 28, 38 33, 25 40Z" fill="#EC4899" opacity="0.8" />
                      <path className="heart-orbit-2" d="M95 40 C88 33, 82 28, 88 22 C94 16, 98 22, 98 22 C98 22, 102 16, 108 22 C114 28, 108 33, 95 40Z" fill="#A78BFA" opacity="0.8" />
                      <path className="heart-orbit-3" d="M60 25 C53 18, 47 13, 53 7 C59 1, 63 7, 63 7 C63 7, 67 1, 73 7 C79 13, 73 18, 60 25Z" fill="#F472B6" opacity="0.8" />
                    </g>
                    <defs>
                      <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111]">Find Your Vibe</h3>
              </div>
            </div>

            {/* Card 3: Show Up - Confetti/Pin Animation */}
            <div className="how-card group relative bg-gradient-to-br from-teal-50 to-white rounded-[2rem] p-8 border border-teal-100/50 hover:border-transparent hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                {/* Animated Pin + Confetti Icon */}
                <div className="how-icon-3 relative w-32 h-32 mb-8">
                  <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
                    {/* Confetti pieces */}
                    <g className="confetti">
                      <rect className="confetti-1" x="20" y="20" width="8" height="8" rx="2" fill="#FF6B35" />
                      <rect className="confetti-2" x="90" y="25" width="6" height="6" rx="1" fill="#8B5CF6" />
                      <rect className="confetti-3" x="15" y="60" width="7" height="7" rx="2" fill="#EC4899" />
                      <rect className="confetti-4" x="95" y="55" width="8" height="8" rx="2" fill="#14B8A6" />
                      <circle className="confetti-5" cx="30" cy="90" r="4" fill="#F59E0B" />
                      <circle className="confetti-6" cx="85" cy="85" r="5" fill="#22C55E" />
                      <rect className="confetti-7" x="50" y="15" width="6" height="6" rx="1" fill="#3B82F6" transform="rotate(45 53 18)" />
                      <rect className="confetti-8" x="70" y="10" width="5" height="5" rx="1" fill="#EF4444" transform="rotate(30 72 12)" />
                    </g>
                    {/* Location pin */}
                    <g className="pin-drop">
                      <ellipse cx="60" cy="100" rx="20" ry="6" fill="#14B8A6" opacity="0.2" />
                      <path d="M60 20 C40 20, 30 40, 30 55 C30 75, 60 95, 60 95 C60 95, 90 75, 90 55 C90 40, 80 20, 60 20Z" fill="url(#grad-teal)" />
                      <circle cx="60" cy="50" r="15" fill="white" />
                      <circle cx="60" cy="50" r="8" fill="#14B8A6" />
                    </g>
                    <defs>
                      <linearGradient id="grad-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#22C55E" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#111]">Show Up</h3>
              </div>
            </div>
          </div>

          {/* Connecting line (desktop only) */}
          <div className="hidden md:flex justify-center mt-8">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-24 h-0.5 bg-gradient-to-r from-uh-orange to-uh-pink rounded-full" />
              <ChevronRight className="w-4 h-4 text-uh-pink" />
              <div className="w-24 h-0.5 bg-gradient-to-r from-uh-pink to-uh-purple rounded-full" />
              <ChevronRight className="w-4 h-4 text-uh-purple" />
              <div className="w-24 h-0.5 bg-gradient-to-r from-uh-purple to-uh-teal rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE SHOWCASE ============ */}
      <section ref={featuresRef} className="py-24 px-4 bg-gradient-to-b from-white to-[#F6F6F2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-uh-teal/10 text-uh-teal text-sm font-semibold mb-4">
              Packed with Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111] mb-4">
              Everything You Need
            </h2>
          </div>

          {/* Feature 1: Event Discovery */}
          <div className="feature-item flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uh-orange/10 text-uh-orange text-sm font-medium mb-4">
                <Calendar className="w-4 h-4" />
                Event Discovery
              </div>
              <h3 className="text-3xl font-bold text-[#111] mb-4">
                See What's Happening at a Glance
              </h3>
              <p className="text-lg text-[#6F6F6F] mb-6 leading-relaxed">
                Beautiful event cards with all the details you need. Browse by day, week,
                or month. Every event includes time, location, and the hosting org.
              </p>
              <ul className="space-y-3">
                {['Weekly calendar view', 'Category filtering', 'Real-time updates'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#111]">
                    <div className="w-5 h-5 rounded-full bg-uh-green/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-uh-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-uh-orange/20 to-uh-pink/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                  {/* Mock event cards */}
                  <div className="space-y-3">
                    {[
                      { emoji: '🎉', title: 'Welcome Week Kickoff', org: 'Student Council', time: '6:00 PM', color: '#F3E7FF' },
                      { emoji: '📋', title: 'General Body Meeting', org: 'Engineering Club', time: '7:00 PM', color: '#B9E7F5' },
                      { emoji: '🌍', title: 'Cultural Night', org: 'International Society', time: '8:00 PM', color: '#FFF6A5' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: event.color }}>
                          {event.emoji}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#111] text-sm">{event.title}</p>
                          <p className="text-xs text-[#6F6F6F]">{event.org}</p>
                        </div>
                        <span className="text-xs text-uh-orange font-medium">{event.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Video */}
          <div className="feature-item flex flex-col lg:flex-row-reverse items-center gap-12 mb-24">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uh-purple/10 text-uh-purple text-sm font-medium mb-4">
                <Video className="w-4 h-4" />
                NEW: Video Feature
              </div>
              <h3 className="text-3xl font-bold text-[#111] mb-4">
                Show, Don't Just Tell
              </h3>
              <p className="text-lg text-[#6F6F6F] mb-6 leading-relaxed">
                Clubs can now attach videos to their events. See what you're signing up for
                with preview clips, promo videos, and event highlights.
              </p>
              <ul className="space-y-3">
                {['60-second video previews', 'Auto-play on event details', 'Easy upload for clubs'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#111]">
                    <div className="w-5 h-5 rounded-full bg-uh-purple/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-uh-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-uh-purple/20 to-uh-blue/20 rounded-3xl blur-2xl" />
                <div className="relative bg-[#111] rounded-3xl shadow-2xl overflow-hidden">
                  <video
                    src="/demo-video.mp4"
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full aspect-video object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Categories */}
          <div className="feature-item flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-uh-teal/10 text-uh-teal text-sm font-medium mb-4">
                <Filter className="w-4 h-4" />
                Smart Filtering
              </div>
              <h3 className="text-3xl font-bold text-[#111] mb-4">
                Find Events You Actually Care About
              </h3>
              <p className="text-lg text-[#6F6F6F] mb-6 leading-relaxed">
                Filter by category to find your people. Whether you're into Greek life,
                cultural events, service, or just looking for a good time.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: '🎉', label: 'Social', color: '#F3E7FF' },
                  { emoji: '📋', label: 'Meeting', color: '#B9E7F5' },
                  { emoji: '💰', label: 'Fundraiser', color: '#FFD6A5' },
                  { emoji: '🌍', label: 'Cultural', color: '#FFF6A5' },
                  { emoji: '🏛️', label: 'Greek', color: '#D6F5E3' },
                  { emoji: '🤝', label: 'Service', color: '#FFE4E1' },
                ].map((cat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.emoji} {cat.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-uh-teal/20 to-uh-green/20 rounded-3xl blur-2xl" />
                <div className="relative grid grid-cols-2 gap-3">
                  {[
                    { emoji: '🎉', label: 'Social', count: 24, color: 'from-pink-400 to-purple-500' },
                    { emoji: '📋', label: 'Meeting', count: 18, color: 'from-blue-400 to-cyan-500' },
                    { emoji: '🌍', label: 'Cultural', count: 12, color: 'from-yellow-400 to-orange-500' },
                    { emoji: '🤝', label: 'Service', count: 8, color: 'from-green-400 to-teal-500' },
                  ].map((cat, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3`}>
                        {cat.emoji}
                      </div>
                      <p className="font-semibold text-[#111]">{cat.label}</p>
                      <p className="text-sm text-[#6F6F6F]">{cat.count} events</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOR CLUBS SECTION ============ */}
      <section ref={forClubsRef} className="py-24 px-4 bg-[#111] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-uh-purple/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-uh-orange/10 blur-3xl" />
        </div>

        <div className="clubs-content relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-6">
            For Club Officers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get Your Events{' '}
            <span className="bg-gradient-to-r from-uh-orange to-uh-pink bg-clip-text text-transparent">
              Seen
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Post your events in seconds and reach every student on campus.
            No more flyers, no more spam emails — just one platform everyone checks.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Clock, title: '30-Second Posts', desc: 'Create and publish events in under a minute' },
              { icon: Bell, title: 'Instant Reach', desc: 'Your event appears to all students immediately' },
              { icon: Video, title: 'Video Support', desc: 'Upload promo videos to boost engagement' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <item.icon className="w-8 h-8 text-uh-orange mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#111] font-semibold text-lg hover:scale-105 transition-transform"
          >
            Start Posting Events
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============ SCHOOLS DIRECTORY ============ */}
      <section ref={schoolsRef} id="schools" className="py-24 px-4 bg-[#F6F6F2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uh-orange/10 text-uh-orange text-sm font-semibold mb-4">
              <MapPin className="w-4 h-4" />
              University of Houston
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111] mb-4">
              Browse UH Events
            </h2>
            <p className="text-lg text-[#6F6F6F]">
              Your campus. Your community. Your events.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              // Skeleton loaders
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            ) : schools.length > 0 ? (
              schools.map((school) => (
                <Link
                  key={school.id}
                  to={`/${school.slug}`}
                  className="school-card group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                      style={{ backgroundColor: school.color || '#FF6B35' }}
                    >
                      {school.slug.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#111] group-hover:text-uh-orange transition-colors">
                        {school.name}
                      </h3>
                      <p className="text-sm text-[#6F6F6F] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {school.location}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-uh-orange group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-[#6F6F6F]">No schools available yet. Check back soon!</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#6F6F6F] mb-4">Want ClubSpace at your campus?</p>
            <button className="px-6 py-3 rounded-full bg-white border border-gray-200 text-[#111] font-medium hover:border-uh-orange hover:text-uh-orange transition-colors">
              Request Your School
            </button>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-16 px-4 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Explore UH Events?
            </h2>
            <p className="text-white/60 mb-8">
              Join Coogs discovering what's happening on campus.
            </p>
            <Link
              to="#schools"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-uh-orange to-uh-pink text-white font-semibold text-lg hover:scale-105 transition-transform"
            >
              Browse Events
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-uh-orange to-uh-pink flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-white font-semibold">ClubSpace</span>
            </div>

            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} ClubSpace. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                src="/demo-video.mp4"
                controls
                autoPlay
                className="w-full aspect-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Caption */}
            <p className="text-center text-white/60 text-sm mt-4">
              ClubSpace Demo • Student Organization Events Platform
            </p>
          </div>
        </div>
      )}

      {/* Marquee animation styles */}
      <style>{`
        @keyframes marquee-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-infinite {
          animation: marquee-infinite 40s linear infinite;
          padding-left: 16px;
          padding-right: 16px;
        }
        .animate-marquee-infinite:hover {
          animation-play-state: paused;
        }
        .slider-container {
          overflow-x: clip;
          overflow-y: visible;
          mask-image: linear-gradient(to right, transparent, black 3%, black 97%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 3%, black 97%, transparent);
        }
      `}</style>
    </div>
  );
}
