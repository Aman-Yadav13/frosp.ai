import { getReplsByUserId } from "@/api/repl";
import { cn } from "@/lib/utils";
import { Repl } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { MdError } from "react-icons/md";
import { UserReplsTable } from "./tables/UserReplsTable";

export const UserReplsComponent = () => {
  const [error, setError] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userRepls, setUserRepls] = useState<Repl[]>([]);
  const getUserRepls = useCallback(async () => {
    try {
      const response = await getReplsByUserId();
      const repls = response.repls;
      setUserRepls(
        repls.map((repl: Repl) => ({
          _id: repl._id,
          name: repl.name,
          collaborators: repl.collaborators,
          collaborative: repl.collaborative,
          createdAt: repl.createdAt,
          updatedAt: repl.updatedAt,
          owner: repl.owner,
          language: repl.language,
        }))
      );
      setFetching(false);
    } catch (e) {
      setFetching(false);
      setError(true);
    }
  }, []);

  useEffect(() => {
    getUserRepls();
  }, [getUserRepls]);

  return (
    <div className="col-span-5 row-span-3 bg-transparent rounded-md border border-gray-400 shadow-sm shadow-gray-200 flex flex-col">
      <div className="h-auto py-2 px-2 bg-cyan-950 rounded-t-md border-b border-b-indigo-200">
        <p className="text-gray-100 text-lg">Your Projects</p>
      </div>
      <div
        className={cn(
          "flex-1 overflow-hidden",
          (error || fetching) && "flex items-center justify-center"
        )}
      >
        {fetching && (
          <div className="flex items-center justify-center rounded-full bg-transparent border-2 border-t-gray-300 border-r-gray-300 border-b-gray-600 border-l-gray-600 animate-spin h-10 w-10" />
        )}
        {error && !fetching && (
          <div className="flex items-center justify-center gap-2">
            <MdError className="h-6 w-6 text-red-300" />
            <div>
              <p className="text-lg text-red-300">Error fetching projects</p>
              <p className="text-xs text-slate-400">
                Please make sure you are logged in.
              </p>
            </div>
          </div>
        )}
        {!error && !fetching && (
          <>
            <div className="h-full w-full bg-transparent overflow-auto">
              <UserReplsTable repls={userRepls} setUserRepls={setUserRepls} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
