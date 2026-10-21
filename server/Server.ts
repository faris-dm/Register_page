// import express from "express"
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import Pool from "./src/config/db.js";
import Registation from "./src/Routes/Register.js";
import OauthBack from "./src/Routes/OauthBack.js";
import cookieParser from "cookie-parser";
import Me from "./src/config/me.js";
import Reset from "./src/Routes/Reset.js"

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", Me);
app.use("/api",Reset)

const PORT = 2040;
app.use("/api", Registation);
app.use("/api/", OauthBack);
app.get("/api/test", (_req, res) => res.send("new code is running"));
app.get("/", (req: Request, res: Response) => {
  res.send(" ths server is running on 2040");
});

Pool.query("SELECT NOW()")
  .then((e) => console.log("db connected", e.rows[0]))
  .catch((d) => console.log("db failed", d.message));

app.listen(PORT, () => {
  console.log(` the port is running in the http://localhost:${PORT}`);
});
