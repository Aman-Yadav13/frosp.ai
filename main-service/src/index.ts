import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import replRoutes from "./routes/replRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3001;

app.use("/api/v1/project", replRoutes);
app.use("/api/v1/user", userRoutes);

mongoose
  .connect(process.env.CONNECTION_URL!)
  .then(() => {
    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error: any) => console.log(error));
