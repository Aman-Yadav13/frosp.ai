import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import k8s_rm_router from "./routes/k8s_rm.ts";
import mongoose from "mongoose";
import http from "http";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // credentials: true,
  // optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use("/api/v1/init", k8s_rm_router);

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.CONNECTION_URL!).then(() => {
  const server = http.createServer(app);
  server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
