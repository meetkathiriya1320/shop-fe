import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <motion.section
      className="relative h-[60vh] flex items-start justify-center bg-cover bg-center pt-20"
      style={{ backgroundImage: "url('/photo/Men_1600x600_71e2de8e-1450-42a7-ae4f-a55af7e22c8a.webp')" }}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5 }}
    >
      <div className="relative z-10 text-center text-white px-4">
        <motion.h1
          className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Shop Men's Collection
        </motion.h1>
        <motion.p
          className="text-base md:text-lg lg:text-xl mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Latest styles, jackets, shirts & more.
        </motion.p>
        <motion.button
          className="bg-[#D4AF37] hover:bg-[#B8860B] text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Shop Now
        </motion.button>
      </div>
    </motion.section>
  );
};

export default Hero;