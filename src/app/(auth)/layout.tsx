"use client";

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Shield,
  Zap,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: "End-to-End Encrypted",
      description:
        "Your conversations are protected with military-grade encryption",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Messages delivered instantly, anywhere in the world",
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with millions of users across 150+ countries",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="w-full min-h-screen flex bg-black text-white overflow-hidden relative">
      {/* Global Styles */}

      {/* Animated Background - Full Screen */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Mouse follow gradient */}
        <div
          className="absolute inset-0 opacity-20 transition-all duration-500"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(234, 179, 8, 0.15), transparent 40%)`,
          }}
        />

        {/* Static gradients */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 50%)
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
      </div>

      {/* Left Side - Branding Panel (Hidden on mobile) */}
      <div
        className={`hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-8 xl:p-12 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
        }`}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-amber-900/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse-glow" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "-2s" }}
        />

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border border-yellow-500/20 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 border border-amber-500/20 rounded-full animate-float-reverse" />
        <div
          className="absolute top-1/2 right-1/3 w-12 h-12 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl rotate-45 animate-float"
          style={{ animationDelay: "-3s" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300 font-medium">
                Trusted by 10M+ users
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Connect with
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                anyone, anywhere
              </span>
            </h1>

            <p className="text-lg xl:text-xl text-gray-400 leading-relaxed">
              Join millions of people who trust ChitChaat for secure,
              lightning-fast messaging and crystal-clear video calls.
            </p>
          </div>

          {/* Rotating Features */}
          <div className="relative h-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-start gap-4 transition-all duration-500 ${
                  currentFeature === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                  <feature.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feature indicators */}
          <div className="flex gap-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentFeature === index
                    ? "w-8 bg-gradient-to-r from-yellow-500 to-amber-500"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Feature ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                150+
              </div>
              <div className="text-sm text-gray-500">Countries</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                5B+
              </div>
              <div className="text-sm text-gray-500">Messages/day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form Container */}
      <div
        className={`w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-4 sm:p-6 md:p-8 relative transition-all duration-1000 delay-200 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
        }`}
      >
        {/* Background for right side */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black lg:from-gray-950/50 lg:via-gray-900/30 lg:to-black/80" />

        {/* Floating orbs for right side */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-yellow-500/5 rounded-full blur-[80px] animate-float lg:hidden" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] animate-float-reverse lg:hidden" />

        {/* Mobile Logo (shown only on mobile/tablet) */}

        {/* Auth Form Card */}
        <div className="relative z-10 w-full max-w-md mt-16 lg:mt-0 flex flex-col items-center justify-start">
          {/* Glass card effect */}
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50" />

            <div className="mt-2">{children}</div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-xs sm:text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-yellow-500 hover:text-yellow-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        
      </div>
    </div>
  );
}

export default AuthLayout;
