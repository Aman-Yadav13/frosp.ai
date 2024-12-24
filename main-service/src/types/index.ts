export type UserType = {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
};
