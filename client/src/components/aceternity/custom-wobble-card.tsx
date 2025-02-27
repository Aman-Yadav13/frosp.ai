import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { useCustomTabs } from "@/hooks/useCustomTabs";

export const CustomWobbleCard = ({
  children,
  containerClassName,
  className,
  borderRadius = "1rem",
  type,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  type: string;
  borderRadius?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { tabs } = useCustomTabs((state) => state);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 40;
    const y = (clientY - (rect.top + rect.height / 2)) / 40;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
        borderRadius: borderRadius,
      }}
      className={cn(
        "w-full bg-transparent relative overflow-hidden p-[1px]",
        containerClassName
      )}
    >
      {!isHovering && type === tabs[0].value && (
        <div
          className="absolute inset-0"
          style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
        >
          <MovingBorder rx="30%" ry="30%">
            <div
              className={cn(
                "h-32 w-32 opacity-[0.8] bg-[radial-gradient(var(--slate-200)_40%,transparent_60%)]"
              )}
            />
          </MovingBorder>
        </div>
      )}

      <motion.div
        style={{
          transform: isHovering
            ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.01, 1.01, 1)`
            : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
          transition: "transform 0.1s ease-out",
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
        className={cn(
          "relative backdrop-blur-[1000px] text-white w-full h-full text-sm antialiased",
          isHovering && "border-none",
          type === tabs[0].value && "border-slate-600 border",
          className
        )}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

export const MovingBorder = ({
  children,
  duration = 6000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: any;
}) => {
  const pathRef = useRef<any>();
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};
