import express from "express";

import { ENTRY_INDEX_NAME } from "src/helper/elastic";
import { handler as GET_ENTRY_ROUTE } from "src/routes/entry/get";
import { handler as IMPORT_ROUTE } from "src/routes/entry/import";

const app = express();

app.post("/import", IMPORT_ROUTE);
app.get(`/${ENTRY_INDEX_NAME}/:id(\\d+)`, GET_ENTRY_ROUTE);

app.listen(80, () => console.log("server started on port 80"));
