import { Request, Response } from "express";

export let join = (req: Request, res: Response) => {
  console.log("going to join.html");
  res.redirect("/join.html");
};
