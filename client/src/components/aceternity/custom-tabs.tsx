"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCustomTabs } from "@/hooks/useCustomTabs";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const LandingTabs = ({
  tabs: propTabs,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const { tabs, setTabs, active, setActive } = useCustomTabs((state) => state);
  useEffect(() => {
    setTabs(propTabs);
    setActive(propTabs[0]);
  }, []);

  return (
    <FadeInDiv
      tabs={tabs}
      active={active}
      key={active?.value}
      className={cn("", contentClassName)}
    />
  );
};

export const FadeInDiv = ({
  className,
  tabs,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === tabs[0].value;
  };
  return (
    <div className="relative w-full h-full items-center justify-center flex -translate-x-[190px]">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: idx === 0 ? 1 : 0.85,
            top: idx === 0 ? 0 : idx === 1 ? 0 : 0,
            zIndex: idx === 0 ? 100 : 10,
            opacity: idx === 0 ? 1 : 1,
            left:
              idx === 0
                ? "50%"
                : idx === 1
                ? "calc(50% - 200px)"
                : "calc(50% + 200px)",
            rotateY: idx === 0 ? 0 : 10,
            rotateZ: idx === 0 ? 0 : idx === 1 ? -2 : 2,
          }}
          animate={{
            y: isActive(tab) ? [0, 20, 0] : 0,
          }}
          className={cn("w-fit h-full absolute", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
