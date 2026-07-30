import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// 1. Custom Cursor System
export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Smooth spring physics
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      
      // Check if hovering over a clickable element
      const target = e.target;
      const isClickable = target.closest('button, a, [role="button"]');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{ x, y }}
      className="hidden lg:block fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
    >
      <motion.div
        animate={{ scale: isHovering ? 3.5 : 1, backgroundColor: isHovering ? '#14F195' : '#FFFFFF' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-8 h-8 rounded-full"
      />
    </motion.div>
  );
}

// 2. Magnetic Button Wrapper
export function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    
    // Magnetic pull strength (max 15px)
    x.set(offsetX * 0.3);
    y.set(offsetY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}