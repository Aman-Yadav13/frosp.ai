import { useModal } from "@/hooks/useModal";
import { BaseModal } from "./base-modal";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

export const InspectProjectModal = () => {
  const { data, onClose } = useModal();
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const handleOpenProject = () => {
    onClose();
    navigate(`/project/${userInfo._id}/${data._id}`);
  };

  if (!data) return null;

  return (
    <BaseModal
      modalType="InspectProject"
      key={"InspectProject"}
      outsideClickHook={false}
      className="xl:max-w-[30%] lg:max-w-[40%] max-w-[75%]"
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-lg text-white/80 font-semibold capitalize">
          {data.name}
        </div>
        <Button onClick={handleOpenProject}>Open Project</Button>
      </div>
    </BaseModal>
  );
};
