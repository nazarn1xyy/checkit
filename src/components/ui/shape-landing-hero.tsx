"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-white/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGeometric() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-sky-500/[0.03] blur-3xl" />

            <div className="absolute inset-0">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={32}
                    gradient="from-blue-500/[0.15]"
                    className="left-[-5%] md:left-[-10%] top-[8%] md:top-[12%]"
                />

                <ElegantShape
                    delay={0.8}
                    width={400}
                    height={100}
                    rotate={-15}
                    gradient="from-sky-500/[0.15]"
                    className="right-[15%] md:right-[20%] top-[15%] md:top-[18%]"
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-45}
                    gradient="from-cyan-500/[0.15]"
                    className="left-[45%] md:left-[55%] top-[5%] md:top-[8%]"
                />

                <ElegantShape
                    delay={0.6}
                    width={500}
                    height={120}
                    rotate={20}
                    gradient="from-blue-400/[0.15]"
                    className="left-[10%] md:left-[5%] top-[35%] md:top-[40%]"
                />

                <ElegantShape
                    delay={0.7}
                    width={250}
                    height={60}
                    rotate={-25}
                    gradient="from-teal-500/[0.15]"
                    className="right-[-5%] md:right-[-10%] top-[40%] md:top-[45%]"
                />

                {/* Additional scattered shapes */}
                <ElegantShape
                    delay={0.45}
                    width={450}
                    height={110}
                    rotate={65}
                    gradient="from-indigo-500/[0.15]"
                    className="left-[35%] md:left-[40%] top-[55%] md:top-[60%]"
                />

                <ElegantShape
                    delay={0.65}
                    width={350}
                    height={80}
                    rotate={-50}
                    gradient="from-sky-400/[0.15]"
                    className="right-[20%] md:right-[25%] top-[70%] md:top-[75%]"
                />

                <ElegantShape
                    delay={0.9}
                    width={280}
                    height={70}
                    rotate={15}
                    gradient="from-cyan-400/[0.15]"
                    className="left-[-5%] md:left-[0%] top-[80%] md:top-[85%]"
                />

                <ElegantShape
                    delay={0.35}
                    width={600}
                    height={150}
                    rotate={-5}
                    gradient="from-blue-600/[0.15]"
                    className="right-[35%] md:right-[45%] top-[90%] md:top-[95%]"
                />

                <ElegantShape
                    delay={0.55}
                    width={300}
                    height={80}
                    rotate={-38}
                    gradient="from-teal-400/[0.15]"
                    className="right-[-5%] md:right-[5%] top-[85%] md:top-[88%]"
                />
            </div>

            {/* Gradient mask to blend into the rest of the page at the very bottom */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none" />
        </div>
    );
}
