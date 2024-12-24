import { Language, Stack } from "@/types";
import API_CLIENT from ".";

export const createProject = async (payload: {
  pname: string;
  planguage: Language;
  pstack?: Stack;
}) => {
  const response = await API_CLIENT.post("/project/create", payload);
  return response.data;
};

export const getReplsByUserId = async () => {
  const response = await API_CLIENT.get("/project/getReplsByUserId");
  return response.data;
};

export const getReplByReplid = async (replid: string) => {
  const response = await API_CLIENT.get(`/project/getReplByReplid/${replid}`);
  return response.data;
};

export const deleteReplByReplid = async (replid: string) => {
  const response = await API_CLIENT.delete(
    `/project/deleteReplByReplid/${replid}`
  );
  return response.data;
};
