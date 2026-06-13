'use client';

import React, { useRef, useLayoutEffect, useState } from 'react';
import {
  motion,
  useTransform,
  useMotionValue,
  useAnimationFrame
} from 'framer-motion';

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);

  return width;
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
  numCopies?: number;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

function VelocityText({
  children,
  baseVelocity = 100,
  className = '',
  numCopies = 6,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const copyRef = useRef<HTMLDivElement>(null);
  const copyWidth = useElementWidth(copyRef);

  function wrap(min: number, max: number, v: number) {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return '0px';
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  useAnimationFrame((t, delta) => {
    if (!isHovered) {
      const moveBy = baseVelocity * (delta / 1000);
      baseX.set(baseX.get() + moveBy);
    }
  });

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <div className={`shrink-0 flex ${className}`} key={i} ref={i === 0 ? copyRef : null}>
        {children}&nbsp;
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${parallaxClassName || ''}`} 
      style={parallaxStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className={`flex whitespace-nowrap text-center font-sans font-bold tracking-tight drop-shadow-sm ${scrollerClassName || ''}`} 
        style={{ x, ...scrollerStyle }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

interface ScrollVelocityProps {
  texts?: React.ReactNode[];
  velocity?: number;
  className?: string;
  numCopies?: number;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

export const ScrollVelocity = ({
  texts = [],
  velocity = 100,
  className = '',
  numCopies = 6,
  parallaxClassName = '',
  scrollerClassName = '',
  parallaxStyle,
  scrollerStyle
}: ScrollVelocityProps) => {
  return (
    <section>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          numCopies={numCopies}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;
