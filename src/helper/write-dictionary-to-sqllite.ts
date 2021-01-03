import fs from "fs";
import { pipeline } from "stream";
import readline from "readline";
import * as jsdom from "jsdom";
import zlib from "zlib";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

import { WordGrade } from "src/definition/korean-open-api";
import { removeWhiteSpaceFromXML } from "src/helper/xml";
import { downloadDictionary } from "src/helper/dictionary";
import {
  insertEntry,
  insertSenses,
  createTables,
  insertExampleInfo,
} from "src/helper/sqllite";

const readLines = async (jsonEntriesFile: string) => {
  const db = await open({
    filename: "database.db",
    driver: sqlite3.Database,
  });

  await createTables(db);

  const excludeIfDoesNotHaveWordGrade = false;
  const dom = new jsdom.JSDOM();
  const domParser = new dom.window.DOMParser();
  const serializer = new dom.window.XMLSerializer();
  const lines = readline.createInterface({
    input: fs.createReadStream(jsonEntriesFile),
  });

  let index = 0;

  for await (const line of lines) {
    const { _source } = JSON.parse(line);
    const modifiedXML = removeWhiteSpaceFromXML(_source.xml);
    const xml = serializer.serializeToString(modifiedXML.documentElement);
    const doc = domParser.parseFromString(xml, "application/xml");
    const word_grade = doc.querySelector("item word_info word_grade")
      .textContent;

    if (excludeIfDoesNotHaveWordGrade && word_grade === WordGrade.none) {
      continue;
    }

    await Promise.all([
      insertEntry(db, doc),
      insertSenses(db, doc),
      insertExampleInfo(db, doc),
    ]);

    if (index % 100 === 0) {
      console.log("index =", index);
    }

    index++;
  }

  console.log("finished importing sqllite database");

  db.close();
};

export const writeToSQLLite = async () => {
  const dictionaryGzipFile = `${new Date().getTime()}.gzip`;
  const jsonEntriesFile = `${new Date().getTime()}.json`;
  await downloadDictionary(dictionaryGzipFile);
  const inputStream = fs.createReadStream(dictionaryGzipFile);
  const outputStream = fs.createWriteStream(jsonEntriesFile);

  pipeline(inputStream, zlib.createGunzip(), outputStream, async (e) => {
    fs.unlink(dictionaryGzipFile, (e) => {
      if (e) {
        console.error(e);
      }
    });

    if (e) {
      console.error(e);
      return;
    }

    await readLines(jsonEntriesFile);

    fs.unlink(jsonEntriesFile, (e) => {
      if (e) {
        console.error(e);
      }
    });
  });
};
