import axios from "axios";

export const startK8sContainer = async (payload: {
  replId: string | undefined;
  userId: string | undefined;
}) => {
  const response = await axios.post(
    `http://localhost:3002/api/v1/init/start`,
    payload,
    {
      validateStatus: () => true, // Accept all HTTP status codes as valid
    }
  );
  console.log(response);
  return response;
};

// Modified getK8sNodePorts
export const getK8sNodePorts = async (replId: string) => {
  const response = await axios.get(
    `http://localhost:3002/get-nodeport/${replId}`,
    {
      validateStatus: () => true, // Accept all HTTP status codes as valid
    }
  );
  return response;
};
