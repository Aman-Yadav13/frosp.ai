import { UserReplsComponent } from "../../components/UserReplsComponent";

export const DashboardPage = () => {
  return (
    <div className="h-full w-full py-4 px-4">
      <div className="grid grid-cols-11 grid-rows-7 w-full h-full">
        <UserReplsComponent />
      </div>
    </div>
  );
};
