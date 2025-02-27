import { FeaturesCodeSpace } from "./FeaturesCodeSpace";
import { FeaturesCommunity } from "./FeaturesCommunity";
import { FeaturesCompare } from "./FeaturesCompare";
import { FeaturesDock } from "./FeaturesDock";
import { FeaturesLanguages } from "./FeaturesLanguages";

export const FeaturesSection = () => {
  return (
    <div className="h-auto w-full">
      <FeaturesDock />
      <div className="mt-32 h-[50vh] w-full">
        <div className="h-full w-full px-6 grid grid-cols-2 grid-rows-2 content-center gap-x-10">
          <div className="col-span-1 row-span-2 pl-24 pr-16 py-4 flex items-start justify-center flex-col gap-2">
            <p className="text-4xl font-bold text-slate-300">
              Faster than your{" "}
              <span className="text-transparent bg-clip-text font-extrabold bg-gradient-to-r from-sky-500 to-emerald-500">
                imagination
              </span>
            </p>
            <p className="text-base text-slate-300 text-balance">
              Spin up new dev environment for any sized project in seconds with
              prebuilt images. Scale your cloud VMs up to 32 cores and 64GB of
              RAM. With low-latency connections across four regions, you won't
              even remember it's not your local machine. For more information,
              read the docs.
            </p>
            <div className="mt-6 flex justify-between items-center w-[80%]">
              <div className="flex flex-col">
                <p className="text-slate-400 text-xs font-semibold">
                  CPUs up to
                </p>
                <span className="text-2xl -mt-[2px] font-bold text-slate-200">
                  32 cores
                </span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-400 text-xs font-semibold">
                  Memory up to
                </p>
                <span className="text-2xl -mt-[2px] font-bold text-slate-200">
                  64 GB
                </span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-400 text-xs font-semibold">Spin up</p>
                <span className="text-2xl -mt-[2px] font-bold text-slate-200">
                  {"<10 sec"}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-1 row-span-2 px-4 py-4 flex items-center justify-center">
            <div className="relative h-[95%] aspect-square">
              <div className="absolute w-[125%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[10%] left-0 top-[10%]" />
              <div className="absolute w-[115%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[7%] left-0 top-[20%]" />
              <div className="absolute w-[125%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[10%] left-0 top-[30%]" />
              <div className="absolute w-[115%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[7%] left-0 top-[40%]" />
              <div className="absolute w-[125%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[10%] left-0 top-[50%]" />
              <div className="absolute w-[115%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[7%] left-0 top-[60%]" />
              <div className="absolute w-[125%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[10%] left-0 top-[70%]" />
              <div className="absolute w-[115%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[7%] left-0 top-[80%]" />
              <div className="absolute w-[125%] h-[2px] bg-gradient-to-r from-sky-600 via-sky-700 to-emerald-800 -translate-x-[10%] left-0 top-[90%]" />
              <div className="absolute h-[125%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[10%] top-0 left-[10%]" />
              <div className="absolute h-[115%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[7%] top-0 left-[20%]" />
              <div className="absolute h-[125%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[10%] top-0 left-[30%]" />
              <div className="absolute h-[115%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[7%] top-0 left-[40%]" />
              <div className="absolute h-[125%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[10%] top-0 left-[50%]" />
              <div className="absolute h-[115%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[7%] top-0 left-[60%]" />
              <div className="absolute h-[125%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[10%] top-0 left-[70%]" />
              <div className="absolute h-[115%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[7%] top-0 left-[80%]" />
              <div className="absolute h-[125%] w-[2px] bg-gradient-to-b from-sky-600 via-sky-700 to-emerald-800 -translate-y-[10%] top-0 left-[90%]" />
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-sky-600  to-emerald-500 rounded-[26px] shadow-lg shadow-green-700 backdrop-blur-lg" />
              <div className="rounded-[26px] bg-neutral-800 h-[98%] w-[99%] relative translate-y-[1%] translate-x-[0.5%] px-4 py-4">
                <div className="absolute bg-gradient-to-r from-sky-400 via-sky-600  to-emerald-500 rounded-[22px] inset-4" />
                <div className="rounded-[20px] bg-neutral-800 h-[96%] w-[96%] relative translate-y-[2%] translate-x-[2%] px-5 py-8">
                  <div className="flex flex-col gap-1 w-full h-full">
                    <div className="px-1 py-1 flex items-start gap-[4px] justify-start border rounded-md border-neutral-700 shadow-lg shadow-neutral-900">
                      <div className="rounded-full h-[10px] w-[10px] mt-[3px] border border-neutral-300 bg-transparent" />
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-300">2-core</p>
                        <span className="text-xs font-semibold text-neutral-500">
                          4GB RAM - 32GB storage
                        </span>
                      </div>
                    </div>
                    <div className="px-1 py-1 flex items-start gap-[4px] justify-start border rounded-md border-neutral-700 shadow-lg shadow-neutral-900">
                      <div className="rounded-full h-[10px] w-[10px] mt-[3px] border border-neutral-300 bg-transparent" />
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-300">4-core</p>
                        <span className="text-xs font-semibold text-neutral-500">
                          8GB RAM - 32GB storage
                        </span>
                      </div>
                    </div>
                    <div className="px-1 py-1 flex items-start gap-[4px] justify-start border rounded-md border-neutral-700 shadow-lg shadow-neutral-900">
                      <div className="rounded-full h-[10px] w-[10px] mt-[3px] border border-neutral-300 bg-transparent" />
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-300">8-core</p>
                        <span className="text-xs font-semibold text-neutral-500">
                          16GB RAM - 32GB storage
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute bg-gradient-to-r from-sky-400 via-sky-600  to-emerald-500 rounded-md inset-0" />
                      <div className="h-[95%] w-[99%] translate-x-[0.5%] translate-y-[2.5%] px-1 py-1 flex items-start gap-[4px] justify-start bg-neutral-700 rounded-md">
                        <div className="rounded-full h-[10px] w-[10px] mt-[3px] border-2 border-sky-600 bg-white " />
                        <div className="flex flex-col">
                          <p className="text-xs text-neutral-300">16-core</p>
                          <span className="text-xs font-semibold text-neutral-500">
                            32GB RAM - 64GB storage
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-1 py-1 flex items-start gap-[4px] justify-start border rounded-md border-neutral-700 shadow-lg shadow-neutral-900">
                      <div className="rounded-full h-[10px] w-[10px] mt-[3px] border border-neutral-300 bg-transparent" />
                      <div className="flex flex-col">
                        <p className="text-xs text-neutral-300">32-core</p>
                        <span className="text-xs font-semibold text-neutral-500">
                          64GB RAM - 128GB storage
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-32 w-full h-[100vh] grid grid-cols-5 gap-y-3 gap-x-3 grid-rows-2 px-28">
        <FeaturesCodeSpace/>
        <FeaturesCompare />
        <FeaturesLanguages/>
        <FeaturesCommunity/>
      </div>
    </div>
  );
};
