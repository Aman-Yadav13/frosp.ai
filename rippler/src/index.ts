import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initWs } from "./ws.ts";

const app = express();
app.use(cors());

const httpServer = createServer(app);

initWs(httpServer);

const port = process.env.PORT || 30001;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
