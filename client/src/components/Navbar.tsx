import { useModal } from "@/hooks/useModal";
import { Button } from "./ui/button";
import { useUser } from "@/hooks/useUser";
import { UserComponent } from "./user-component";
import { Skeleton } from "./ui/skeleton";

interface NavbarProps {
  isLoginProcessed: boolean;
}

export const Navbar = ({ isLoginProcessed }: NavbarProps) => {
  const state = useUser((state) => state);
  const { onOpen } = useModal();
  const handleLoginModalOpen = () => {
    onOpen("Login");
  };
  const openCreateProjectModal = () => {
    onOpen("CreateProject");
  };

  return (
    <>
      <div className="h-[58px] bg-gray-800 flex items-center justify-center px-4 py-1 border-b border-b-gray-600">
        <div className="flex items-center justify-between w-full">
          <div>{/* Logo */}</div>
          <div className="self-center">
            {!isLoginProcessed ? (
              <LoginSkeleton />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Button onClick={openCreateProjectModal}>
                    Create project
                  </Button>
                  {state.isLoggedIn ? (
                    <>
                      <UserComponent />
                    </>
                  ) : (
                    <>
                      <Button
                        variant="login"
                        onClick={handleLoginModalOpen}
                      ></Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const LoginSkeleton = () => {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="w-28 h-8" />
      <Skeleton className="w-24 h-8" />
    </div>
  );
};
