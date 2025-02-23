import { useModal } from "@/hooks/useModal";
import { BaseModal } from "./base-modal";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { format, formatDistanceToNow } from "date-fns";
import { getLanguageIcon, getLanguageStyles } from "@/lib/helpers";
import { Switch } from "../ui/switch";
import { updateCollaborationStatus } from "@/api/repl";
import { toast } from "sonner";
import { useCurrentProject } from "@/hooks/useCurrentProject";

export const InspectProjectModal = () => {
  const { data, setData, onClose } = useModal();
  const { userInfo } = useUser();
  const { setProject } = useCurrentProject((state) => state);
  const navigate = useNavigate();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate();
    const suffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${suffix(day)} ${format(date, "MMMM yyyy")}`;
  };
  const FormattedDate = (date: string) => {
    const formattedDate = formatDate(date);
    return <>{formattedDate}</>;
  };

  const handleOpenProject = () => {
    onClose();
    setProject(data);
    navigate(`/project/${userInfo._id}/${data._id}`);
  };

  const getIconForLanguage = () => {
    const Icon = getLanguageIcon(data.language);
    const iconStyles = getLanguageStyles(data.language);
    return Icon ? <Icon className={iconStyles} /> : null;
  };

  const handleCollaborativeChange = async () => {
    try {
      const resp = await updateCollaborationStatus(data._id);
      if (resp?.success) {
        if (resp?.data?.collaborative) {
          toast.success(`Project ${data.name} is now collaborative.`);
        } else {
          toast.success(`Project ${data.name} is no longer collaborative.`);
        }
        setData({ ...data, collaborative: !data.collaborative });
      } else {
        toast.error(`Failed to update collaboration status.`);
      }
    } catch (e) {
      console.log(e);
      toast.error(`Failed to update collaboration status.`);
    }
  };

  if (!data) return null;

  console.log(data);
  return (
    <BaseModal
      modalType="InspectProject"
      key={"InspectProject"}
      outsideClickHook={false}
      className="xl:max-w-[40%] lg:max-w-[40%] max-w-[75%]"
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-2xl text-white/80 font-semibold capitalize">
          Project Settings
        </div>
        <div className="mt-6">
          <div className="flex flex-col gap-2 border px-3 py-2 rounded-md border-slate-600 hover:border-slate-500 transition-colors">
            <div className="flex items-center gap-2 justify-between rounded-md w-full">
              <p className="font-semibold">Project Name: </p>
              <span className="capitalize bg-gray-800 text-slate-400 rounded-md px-2 py-1">
                {data.name}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between rounded-md w-full">
              <p className="font-semibold capitalize">Created on: </p>
              <span className="capitalize bg-gray-800 text-slate-400 rounded-md px-2 py-1">
                {FormattedDate(data.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between rounded-md w-full">
              <p className="font-semibold capitalize">Last modified: </p>
              <span className="capitalize bg-gray-800 text-slate-400 rounded-md px-2 py-1">
                {formatDistanceToNow(new Date(data.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-between rounded-md w-full">
              <p className="font-semibold capitalize">Language: </p>
              <span className="capitalize bg-gray-800 text-slate-400 rounded-md px-2 py-1">
                {getIconForLanguage()}
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 border px-3 py-2 rounded-md border-slate-600 hover:border-slate-500 transition-colors">
            <div className="flex items-center gap-2 justify-between rounded-md w-full">
              <p className="font-semibold capitalize">Collaborative: </p>
              <Switch
                checked={data.collaborative}
                onCheckedChange={handleCollaborativeChange}
              />
            </div>
            {data.collaborative && (
              <>
                {data.collaborators.length > 0 ? (
                  <div className=""></div>
                ) : (
                  <div className="flex items-center gap-2 justify-between">
                    <p className="font-semibold capitalize">Collaborators:</p>
                    <span className="bg-gray-800 text-slate-400 rounded-md px-2 py-1 truncate">
                      No collaborators yet.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Button onClick={handleOpenProject}>Open Project</Button>
      </div>
    </BaseModal>
  );
};
