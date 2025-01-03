import { useParams } from "react-router-dom";

export const Output = () => {
  const { projectId } = useParams();
  const INSTANCE_URI = `http://frosp-rippler.duckdns.org/${projectId}/user/`;

  // useEffect(() => {});

  return (
    <div className="w-full bg-white min-h-[40vh]">
      <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
  );
};
