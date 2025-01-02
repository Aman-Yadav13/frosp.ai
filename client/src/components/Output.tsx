import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const Output = () => {
  const { projectId } = useParams();
  const INSTANCE_URI = `http://frosp-rippler.duckdns.org/${projectId}/user/`;

  // useEffect(() => {});

  return (
    <div style={{ height: "40vh", background: "white" }}>
      <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
  );
};
