export type UserInfo = {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  updatedAt: string;
  createdAt: string;
};

export type ActiveUser = {
  userId: string;
  userName: string;
  color: string;
  currentFile: string | null;
};

export type Repl = {
  collaborative: boolean;
  _id: string;
  updatedAt: string;
  createdAt: string;
  language: Language;
  collaborators: string[];
  name: string;
  owner: string;
};

export enum Language {
  NODEJS = "nodejs",
  PYTHON = "python",
}

export enum Stack {
  MERN = "mern",
  MEAN = "mean",
  MEVN = "mevn",
}
