import { useFileEditor } from "@/hooks/useFileEditor";
import { cn } from "@/lib/utils";

interface FooterToolsProps {
  socket: any;
}

export const FooterTools = ({ socket }: FooterToolsProps) => {
  const { isUpdatingFileStructure } = useFileEditor();

  return (
    <div className="h-[20px] w-full bg-neutral-900 pl-2 pr-[1px] pt-[3px] pb-[1px]">
      <div className="h-full w-full flex items-center">
        <div className="ml-auto flex items-center gap-2">
          {isUpdatingFileStructure && (
            <div className="h-[14px] w-[14px] rounded-full bg-transparent border-2 border-t-gray-500 border-l-gray-500 border-b-gray-200 border-r-gray-200 animate-spin"></div>
          )}
          <div
            className={cn(
              "text-xs px-[4px] py-[1px] cursor-pointer rounded-sm",
              socket?.connected ? "bg-green-800" : "bg-red-700"
            )}
          >
            {socket?.connected ? <p>Connected</p> : <p>Disconnected</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
