import { UserReplsComponent } from "./UserReplsComponent";

export const HomePageContent = () => {
  return (
    <div className="h-full w-full py-4 px-4">
      <div className="grid grid-cols-11 grid-rows-7 w-full h-full">
        <UserReplsComponent />
      </div>
    </div>
  );
};
