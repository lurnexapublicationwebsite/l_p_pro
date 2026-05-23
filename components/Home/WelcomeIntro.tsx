"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function WelcomeIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const played = localStorage.getItem("introPlayed");
    if (!played) {
      setShow(true);
      localStorage.setItem("introPlayed", "true");

      setTimeout(() => {
        setShow(false);
      }, 2600);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-[#FFF0E6]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center flex flex-col items-center"
          >
            {/* 🎥 GIF GOES HERE */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 w-[140px] sm:w-[180px] md:w-[220px]"
            >
              <Image
                src="/LOGO_@_.gif"
                alt="Welcome to Lurnexa"
                width={300}
                height={300}
                priority
                className="w-full h-auto"
              />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-sm sm:text-base font-semibold text-blue-700"
            >
              Welcome to
            </motion.p>

            <motion.h1
              initial={{ letterSpacing: "0.3em", opacity: 0 }}
              animate={{ letterSpacing: "0.05em", opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-black"
            >
              LURNEXA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-1 text-xs sm:text-sm text-slate-700 italic"
            >
              Publications
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
