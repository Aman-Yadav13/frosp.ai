import { ChevronRight } from "lucide-react";
import { Cover } from "./aceternity/cover";
import { Button } from "./ui/button";

export const FeaturesCommunity = () => {
  return (
    <div className="col-span-4 row-span-1 rounded-2xl border relative overflow-hidden">
      <div className="bg-gray-950/20 absolute inset-0 z-20" />
      <div className="absolute -bottom-[245%] left-[50%] -translate-x-[50%] h-[320%] aspect-square bg-gradient-to-r to-emerald-600 via-[#2aa47f] from-indigo-500 rounded-full z-0 blur-sm" />
      <div className="absolute -bottom-[220%] left-[50%] -translate-x-[50%] h-[270%] aspect-square bg-gradient-to-r to-emerald-700 via-[#2aa47f] from-indigo-400 rounded-full z-5 blur-sm" />
      <div />
      <div className="h-full w-full bg-gradient-to-b from-emerald-600 via-[#2A98A4] rounded-2xl to-indigo-500 z-[100] flex items-center justify-center">
        <div className="z-[100] h-full w-full px-8 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-5xl font-bold max-w-[75%] text-balance text-center text-slate-200">
              Start developing projects with rocket{" "}
              <Cover className="select-none cursor-pointer">speed</Cover>
            </p>
            <p className="text-sm">
              Import projects from your github repository, fork public projects
              and many more.
            </p>
          <div className="flex items-center justify-center mt-2 group/btn gap-2">
            <Button asChild className="cursor-pointer bg-slate-100 hover:bg-white !px-6 !py-5">
              <div className="flex items-center gap-1">
                <p>Get Started</p>
                <ChevronRight className="h-4 w-4 mt-[2px]"/>
              </div>
            </Button>
            <Button className="cursor-pointer !px-6 !py-[19px] bg-transparent hover:bg-slate-50/20 text-white border-2 border-slate-200">
                Community
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};
