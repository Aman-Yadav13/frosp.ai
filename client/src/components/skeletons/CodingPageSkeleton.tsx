import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";

export const CodingPageSkeleton = () => {
  return (
    <div className="h-full flex w-full overflow-hidden">
      <div className="h-full w-full absolute z-[100] bg-gray-950 opacity-50" />
      <AnimatePresence>
        <motion.div
          initial={{
            opacity: 0,
            x: 0,
            y: -50,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            translateX: "-50%",
            translateY: "-50%",
          }}
          exit={{
            opacity: 0,
            x: 0,
            y: -50,
            translateX: "-50%",
            translateY: "-50%",
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute top-[5%] left-[50%] -translate-x-[50%] -translate-y-[50%] h-auto w-fit bg-white border border-gray-300 rounded-lg py-2 px-3 overflow-hidden"
        >
          <div className="flex justify-between items-center gap-2">
            <p className="text-gray-700 text-clip">
              Please wait while the project loads
            </p>
            <div className="w-4 h-4 animate-spin flex justify-center items-center">
              <div className="h-4 w-4 border-2 border-t-gray-400 border-b-gray-500 border-r-gray-500  border-l-gray-400 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="group/sidebar h-full bg-gray-950 overflow-y-auto relative flex w-60 flex-col z-[99999]  min-w-[220px]">
        <div className="px-1 py-2">
          <Skeleton className="w-full h-6 rounded-none" />
          <div className="mt-2 flex flex-col gap-1">
            <Skeleton className="w-[75%] h-5 rounded-sm" />
            <Skeleton className="w-[75%] h-5 rounded-sm" />
            <Skeleton className="w-[75%] h-5 rounded-sm" />
            <Skeleton className="w-[75%] h-5 rounded-sm" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex w-full h-full">
        <div className="flex flex-col w-full h-full">
          <div className="min-h-[45px] bg-gray-900 pl-4 pr-2 py-1 w-full overflow-hidden border-b border-b-gray-800">
            <div className="w-full h-full flex items-center overflow-hidden">
              <div></div>
              <Skeleton className="ml-auto h-[90%] w-24 self-center" />
            </div>
          </div>
          <div className="flex-1 w-full h-full flex">
            <Skeleton className="h-full w-1/2 rounded-none" />
            <div className="h-full w-1/2 bg-transparent pl-[2px] pb-[1px] flex flex-col">
              <Skeleton className="h-1/2 w-full rounded-none" />
              <Skeleton className="h-1/2 w-full rounded-none mt-[2px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
