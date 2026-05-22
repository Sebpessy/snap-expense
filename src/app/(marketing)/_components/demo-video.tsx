"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

/**
 * The hero demo video — autoplays muted in a loop, with a clean overlay
 * play/pause + mute toggle. Pauses automatically when scrolled off-screen
 * so we don't burn battery on devices.
 */
export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  // Auto-pause when off-screen, resume when visible. Saves mobile battery.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
          setPlaying(true);
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-600">
            Watch it work
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Snap. Tap. Done — in real time.
          </h2>
        </div>

        <div className="group relative mx-auto overflow-hidden rounded-3xl bg-gray-900 shadow-2xl shadow-blue-950/30 ring-1 ring-black/5">
          <video
            ref={videoRef}
            src="/marketing/xpenz-snap-and-tap.mp4"
            poster="/marketing/hero-person.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block w-full"
            aria-label="Xpenz product demo — snapping a receipt and tagging it to a project in seconds"
            onClick={togglePlay}
          />

          {/* Controls overlay (fade in on hover) */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/30 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:p-4">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause demo" : "Play demo"}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur transition hover:bg-white sm:h-11 sm:w-11"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute demo" : "Mute demo"}
              className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md backdrop-blur transition hover:bg-white sm:h-11 sm:w-11"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
