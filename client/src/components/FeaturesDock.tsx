import { IoSettingsOutline } from "react-icons/io5";
import {
  MdOutlineAnalytics,
  MdOutlineDashboard,
  MdOutlineJoinInner,
  MdSecurity,
} from "react-icons/md";
import { GiArtificialHive } from "react-icons/gi";
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { GrCodepen } from "react-icons/gr";
import { RiUserCommunityLine } from "react-icons/ri";
import { FloatingDock } from "./aceternity/floating-dock";

export const FeaturesDock = () => {
  const features = [
    {
      title: "Dashboard",
      icon: (
        <MdOutlineDashboard className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Settings",
      icon: (
        <IoSettingsOutline className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Analytics",
      icon: (
        <MdOutlineAnalytics className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Collaboration",
      icon: (
        <MdOutlineJoinInner className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "AI Code Assist",
      icon: (
        <GiArtificialHive className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Instant Deployment",
      icon: (
        <AiOutlineDeploymentUnit className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Multi-Language",
      icon: (
        <GrCodepen className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Security",
      icon: (
        <MdSecurity className="h-full w-full text-neutral-300" />
      ),
    },
    {
      title: "Community",
      icon: (
        <RiUserCommunityLine className="h-full w-full text-neutral-300" />
      ),
    },
  ];

  return (
    <div className="w-full h-auto mt-32 flex items-center justify-center">
      <FloatingDock items={features} />
    </div>
  );
};
