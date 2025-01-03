import { Button } from "./ui/button";

interface WorkspaceToolsComponentProps {
  setShowOutput: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkspaceToolsComponent = ({
  setShowOutput,
}: WorkspaceToolsComponentProps) => {
  const handleRunCode = () => {
    setShowOutput((prev) => !prev);
  };

  return (
    <div className="min-h-[45px] bg-gray-900 pl-4 pr-2 py-1 w-full overflow-hidden border-b border-b-gray-800">
      <div className="w-full h-full flex items-center overflow-hidden">
        <Button className="ml-auto text-sm" size={"sm"} onClick={handleRunCode}>
          Show Output
        </Button>
      </div>
    </div>
  );
};
