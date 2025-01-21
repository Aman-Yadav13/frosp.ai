import { getAllProjectsByUserId } from "@/api/repl";
import { UserOwnedProject } from "@/components/UserOwnedProject";
import React, { useCallback, useEffect, useState } from "react";

const UserProjectsPage = () => {
  const [userProjects, setUserProjects] = useState([]);

  const getAllUserProjects = useCallback(async () => {
    try {
      const resp = await getAllProjectsByUserId();
      setUserProjects(resp.repls);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getAllUserProjects();
  }, [getAllUserProjects]);

  return (
    <div style={{ height: `calc(100vh - 58px)` }} className="w-full bg-white">
      <div className="h-full w-full px-4 py-2">
        <div className="h-full w-full grid grid-cols-5 grid-rows-3 gap-3">
          {userProjects.length > 0 &&
            userProjects.map((project: any) => (
              <React.Fragment key={project._id}>
                <UserOwnedProject project={project} />
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserProjectsPage;
