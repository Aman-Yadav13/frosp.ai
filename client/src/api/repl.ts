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

export const getAllProjectsByUserId = async () => {
  const response = await API_CLIENT.get("/project/getAllProjectsByUserId");
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

export const updateCollaborationStatus = async (replid: string) => {
  const response = await API_CLIENT.patch(
    `/project/updateCollaborationStatus/${replid}`
  );
  return response.data;
};

export const getFTL = async (replid: string) => {
  const response = await API_CLIENT.get(`/project/getFTL/${replid}`);
  return response.data;
};

export const getProjectTags = async () => {
  const response = await API_CLIENT.get("/project/getProjectTags");
  return response.data;
};

export const getProjectLanguages = async () => {
  const response = await API_CLIENT.get("/project/getProjectLanguages");
  return response.data;
};

export const updateGeneralProjectDetails = async (
  replId: string,
  payload: any
) => {
  const response = await API_CLIENT.patch(
    `/project/updateGeneralDetails/${replId}`,
    payload
  );
  return response.data;
};

export const updateInviteCode = async (replId: string) => {
  const response = await API_CLIENT.patch(`/project/inviteCode/${replId}`);
  return response.data;
};

export const matchInviteCode = async (replId: string, inviteCode: string) => {
  const response = await API_CLIENT.get(
    `/project/matchInviteCode/${replId}/${inviteCode}`
  );
  return response.data;
};

export const getInviteInformation = async (replId: string) => {
  const response = await API_CLIENT.get(`/project/getInviteInfo/${replId}`);
  return response.data;
};
