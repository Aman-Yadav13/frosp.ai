import { Compare } from "./aceternity/compare";
import { TbHourglassLow } from "react-icons/tb";
import { FaPeoplePulling } from "react-icons/fa6";
import { TbTopologyComplex } from "react-icons/tb";
import { GrInsecure, GrSecure } from "react-icons/gr";
import { RiUserCommunityFill } from "react-icons/ri";
import { GiDeadEye } from "react-icons/gi";
import { SiSinglestore } from "react-icons/si";

export const FeaturesCompare = () => {
  return (
    <div className="w-full grid justify-items-center col-span-2 row-span-1 relative">
      <div className="absolute inset-0 bg-gray-950/30"/>
      <div className="h-full w-full bg-gradient-to-b from-[#53D878] via-[#3AB292] to-[#2A98A4] rounded-xl border border-slate-500">
        <Compare
          className="w-full h-full overflow-hidden"
          firstContent={Withdrawals}
          secondContent={Solutions}
          secondClassName="px-12 py-12 flex items-center justify-center"
          firstClassName="px-12 py-12 flex items-center justify-center"
        />
      </div>
    </div>
  );
};

const Withdrawals = (
  <div className="flex flex-col gap-6 w-full">
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
        <TbHourglassLow className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        Slow Coding Workflow
      </p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
        <FaPeoplePulling className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        Limited collaboration
      </p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
        <TbTopologyComplex className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        Complex environment setup
      </p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl bg-">
      <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center">
        <GrInsecure className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">Security concerns</p>
    </div>
  </div>
);
const Solutions = (
  <div className="flex flex-col gap-6 w-full">
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 flex items-center justify-center rounded-full bg-green-600">
        <GiDeadEye className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        AI-powered suggestions
      </p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 flex items-center justify-center rounded-full bg-green-600">
        <RiUserCommunityFill className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        Real-time Collaboration
      </p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 flex items-center justify-center rounded-full bg-green-600">
        <SiSinglestore className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">Single-click setup</p>
    </div>
    <div className="w-full bg-[#172228] py-4 px-4 flex items-center gap-2 rounded-xl">
      <div className="h-7 w-7 flex items-center justify-center rounded-full bg-green-600">
        <GrSecure className="h-5 w-5 text-white" />
      </div>
      <p className="text-xl font-semibold text-slate-200">
        Isolated sandbox execution
      </p>
    </div>
  </div>
);
