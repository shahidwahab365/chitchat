"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Video,
  Phone,
  Globe,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Play,
  Check,
  Menu,
  X,
  Star,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Animated counter hook
  const useCounter = (
    end: number,
    duration: number = 2000,
    start: number = 0,
  ) => {
    const [count, setCount] = useState(start);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
      if (!hasStarted || !isVisible) return;

      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, [hasStarted, isVisible, end, duration, start]);

    useEffect(() => {
      if (isVisible) setHasStarted(true);
    }, [isVisible]);

    return count;
  };

  // Initialize visibility and scroll handling
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section
      const sections = ["home", "features", "testimonials", "cta"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mouse tracking for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection Observer for sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const featuresObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
        }
      });
    }, observerOptions);

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCtaVisible(true);
        }
      });
    }, observerOptions);

    if (featuresRef.current) featuresObserver.observe(featuresRef.current);
    if (ctaRef.current) ctaObserver.observe(ctaRef.current);

    return () => {
      featuresObserver.disconnect();
      ctaObserver.disconnect();
    };
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "Instant Messaging",
      description:
        "Lightning-fast text conversations with real-time delivery and read receipts",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: Video,
      title: "Crystal Clear Video",
      description:
        "HD video calls that make distance disappear with adaptive quality",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Phone,
      title: "Voice Calling",
      description: "Premium audio quality for natural conversations anywhere",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with anyone, anywhere in the world instantly",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Optimized infrastructure for instant connections and zero lag",
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "End-to-end encryption keeps your conversations safe",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const stats = [
    { number: 10, suffix: "M+", label: "Active Users" },
    { number: 150, suffix: "+", label: "Countries" },
    { number: 99.9, suffix: "%", label: "Uptime" },
    { number: 5, suffix: "B+", label: "Messages Daily" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      content:
        "ChitChaat transformed how our remote team communicates. The video quality is incredible!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Startup Founder",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content:
        "Finally, a messaging app that prioritizes privacy without sacrificing user experience.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content:
        "The best communication tool I've used. Fast, secure, and beautifully designed.",
      rating: 5,
    },
  ];

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Mouse follow gradient */}
        <div
          className="absolute inset-0 opacity-30 transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(234, 179, 8, 0.15), transparent 40%)`,
          }}
        />

        {/* Static gradients */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)
            `,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-[10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-[10%] w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] animate-float" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
            : "bg-transparent"
        } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}

          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === link.href.slice(1)
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <SignedOut>
              <SignInButton>
                <Button className="bg-primary rounded-full font-medium text-sm sm:text-base px-4 sm:px-5 cursor-pointer">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            {/* Show the user button when the user is signed in */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 transition-all duration-300 ${
            mobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <Button
                onClick={() => router.push("/sign-in")}
                className="w-full px-4 py-3 text-gray-300 hover:text-white transition-colors font-medium text-left"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/sign-up")}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        ref={heroRef}
        className="relative z-10 px-4 sm:px-6 pt-28 sm:pt-32 pb-20 sm:pb-32"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 mb-6 sm:mb-8 backdrop-blur-sm transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-10"
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs sm:text-sm text-yellow-300 font-medium">
                Now connecting millions worldwide
              </span>
              <ChevronDown className="w-4 h-4 text-yellow-400 animate-bounce" />
            </div>

            {/* Main Heading */}
            <h1
              className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] transition-all duration-1000 delay-100 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Connect the
              </span>
              <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                World Instantly
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 transition-all duration-1000 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              Experience the future of communication. Video calls, voice chats,
              and instant messaging—all in one{" "}
              <span className="text-yellow-400 font-medium">
                beautiful platform
              </span>
              .
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <Button className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full font-semibold text-base sm:text-lg shadow-xl shadow-yellow-500/25 hover:shadow-2xl hover:shadow-yellow-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2">
                <span>Start Chatting Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-semibold text-base sm:text-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </div>
                <span>Watch Demo</span>
              </Button>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-400 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 hover:bg-white/[0.04] transition-all duration-500"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-1">
                    {stat.number}
                    {stat.suffix}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Scroll
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1.5 h-2.5 rounded-full bg-yellow-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="relative z-10 px-4 sm:px-6 py-20 sm:py-32"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div
            className={`text-center mb-12 sm:mb-20 transition-all duration-1000 ${
              featuresVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300 font-medium">
                Powerful Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                stay connected
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for seamless communication across any
              distance
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm border border-white/[0.05] hover:border-yellow-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden ${
                  featuresVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: featuresVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <div className="w-full h-full rounded-xl sm:rounded-2xl bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-yellow-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-sm sm:text-base text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="relative z-10 px-4 sm:px-6 py-20 sm:py-32 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm text-yellow-300 font-medium">
                Loved by Users
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                What people are
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                saying about us
              </span>
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] hover:border-yellow-500/30 transition-all duration-500"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-yellow-500/20"
                  />
                  <div>
                    <div className="font-semibold text-sm sm:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={ctaRef}
        className="relative z-10 px-4 sm:px-6 py-20 sm:py-32"
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-1000 ${
              ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Content */}
            <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Join millions already chatting
              </h2>

              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
                People around the world trust ChitChaat for their daily
                conversations. Be part of the global community.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
                {[
                  "End-to-end encrypted",
                  "No ads ever",
                  "Free forever",
                  "Works everywhere",
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-xs sm:text-sm font-medium"
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => router.push("/sign-up")}
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-white text-yellow-600 rounded-full font-bold text-base sm:text-lg hover:scale-105 transition-all shadow-2xl hover:shadow-white/30 overflow-hidden"
              >
                <span className="relative z-10">Create Free Account</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-lg sm:text-xl font-bold">ChitChaat</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting the world, one conversation at a time. Your privacy,
                our priority.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Download", "Updates"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Support",
                links: ["Help Center", "Privacy", "Terms", "Contact"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  {section.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 ChitChaat. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              {["Twitter", "GitHub", "LinkedIn", "Discord"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-gray-500 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
