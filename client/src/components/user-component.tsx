import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import { logoutUser } from "@/api/user";
import { useNavigate } from "react-router-dom";

export const UserComponent = () => {
  const navigate = useNavigate();
  const state = useUser((state) => state);
  const { onOpen } = useModal((state) => state);
  const [initial, setInitial] = useState("");
  const [isLogouting, setIsLogouting] = useState(false);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    if (state?.userInfo?.fullName) {
      setInitial(state.userInfo.fullName[0]);
    }
  });
  const onLogoutClick = () => {
    setDropdownOpen(false);
    setLogoutAlertOpen(true);
  };
  const onResetPasswordClick = () => {
    setDropdownOpen(false);
    onOpen("ResetPassword");
  };
  const onModifyAccountDetailsClick = () => {
    setDropdownOpen(false);
    onOpen("ChangeAccountDetails");
  };

  const confirmLogoutClick = async () => {
    setIsLogouting(true);
    try {
      await logoutUser();
      toast.success("Logged out successfully.");
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong. Please try again in some time.");
    } finally {
      setIsLogouting(false);
    }
  };

  const onManageProjectsClick = () => {
    setDropdownOpen(false);
    navigate("/projects");
  };

  return (
    <>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={() => setDropdownOpen((prev) => !prev)}
      >
        <DropdownMenuTrigger asChild>
          <div className="h-10 w-10 rounded-full bg-gray-600 cursor-pointer flex items-center justify-center  hover:scale-[1.02] transition-all hover:bg-gray-700">
            <p className="font-semibold text-lg">{initial}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit bg-neutral-900">
          <DropdownMenuLabel>
            Welcome {state.userInfo.fullName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onManageProjectsClick}>
              Manage Projects
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onResetPasswordClick}>
              Reset password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onModifyAccountDetailsClick}>
              Modify Account Details
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogoutClick}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={logoutAlertOpen}
        onOpenChange={() => {
          setLogoutAlertOpen((prev) => !prev);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLogouting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogoutClick}
              disabled={isLogouting}
            >
              {isLogouting ? "Please wait.." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
