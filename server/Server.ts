// import express from "express"
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import Pool from "./src/config/db.js";
import Registation from "./src/Routes/Register.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api", Registation);

const PORT = 2040;

app.get("/", (req: Request, res: Response) => {
  res.send(" ths server is running on 2040");
});

Pool.query("SELECT NOW()")
  .then((e) => console.log("db connected", e.rows[0]))
  .catch((d) => console.log("db failed", d.message));

app.listen(PORT, () => {
  console.log(` the port is running in the ${PORT}..................`);
});
