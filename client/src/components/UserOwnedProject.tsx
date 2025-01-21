import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface UserOwnedProjectProps {
  project: any;
}

export const UserOwnedProject = ({ project }: UserOwnedProjectProps) => {
  const navigate = useNavigate();
  const handleProjectOpen = () => {};
  const handleSettingsClick = () => {
    navigate("/projects/" + project._id + "/general");
  };
  return (
    <div className="group col-span-1 row-span-1 rounded-sm transition-all duration-100  border border-slate-300 hover:border-slate-400 hover:scale-[1.02] group bg-slate-50 hover:bg-transparent">
      <div className="flex flex-col items-center h-full w-full">
        <div className="h-[80%] w-full relative border-b border-b-slate-400">
          <img
            src={`/assets/projectImages/${project.language}.jpg`}
            alt="Not available"
            className="aspect-video h-full object-cover w-full select-none"
          />
          <div className="bg-gray-950 opacity-30 group-hover:opacity-10 transition-all absolute inset-0" />
          <p className="absolute left-[10px] top-[8px] text-white capitalize text-xl font-semibold">
            {project.name}
          </p>
        </div>
        <div className="mt-[2px] px-1 flex items-center justify-end gap-1 h-[20%] w-full">
          <Button
            className={cn(
              "text-white",
              project.language === "nodejs"
                ? "bg-green-700 hover:bg-green-600"
                : "bg-cyan-700 hover:bg-cyan-600"
            )}
            onClick={handleSettingsClick}
          >
            Settings
          </Button>
          <Button variant={"secondary"} onClick={handleProjectOpen}>
            Open
          </Button>
        </div>
      </div>
    </div>
  );
};
