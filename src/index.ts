import express, { RequestHandler } from "express";
import AdmZip from "adm-zip";
import * as jsdom from "jsdom";

import { writeExcelFile } from "src/helper/dictionary";

const app = express();

const handler: RequestHandler = async (_, res, next) => {
  const time = new Date().getTime();
  const fileName = `./${time}.zip`;

  try {
    await writeExcelFile(fileName);
  } catch (e) {
    next(e);
    return;
  }

  const zip = new AdmZip(fileName);
  const entries = zip.getEntries();

  for (const entry of entries) {
    const data = entry.getData().toString("utf8");
    const dom = new jsdom.JSDOM(data);

    for (const entry of Array.from(
      dom.window.document.querySelectorAll("LexicalEntry")
    )) {
      console.log("first entry val", (entry as any).getAttribute("val"));
      break;
    }

    break;
  }

  res.sendStatus(200);
};

app.post("/index", handler);

app.listen(80, () => console.log("server started on port 80"));
