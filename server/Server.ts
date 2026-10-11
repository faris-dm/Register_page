// import express from "express"
import express from "express";
import type { Request, Response } from "express";
import Pool from "./src/config/db.js";

const app = express();
const PORT = 2040;

app.get("/", (req: Request, res: Response) => {
  res.send(" ths server is running");
});

Pool.query("SELECT NOW()")
  .then((e) => console.log("db connected", e.rows[0]))
  .catch((d) => console.log("db failed", d.message));

app.listen(PORT, () => {
  console.log(` the port is running in the ${PORT}`);
});
