import { cn } from "@/lib/utils";

interface FooterToolsProps {
  socket: any;
}

export const FooterTools = ({ socket }: FooterToolsProps) => {
  return (
    <div className="h-[20px] w-full bg-neutral-900 pl-2 pr-[1px] pt-[3px] pb-[1px]">
      <div className="h-full w-full flex items-center">
        <div
          className={cn(
            "ml-auto text-xs px-[4px] py-[1px] cursor-pointer rounded-sm",
            socket?.connected ? "bg-green-800" : "bg-red-700"
          )}
        >
          {socket?.connected ? <p>Connected</p> : <p>Disconnected</p>}
        </div>
      </div>
    </div>
  );
};
