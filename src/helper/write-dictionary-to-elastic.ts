import fs from "fs";
import { pipeline } from "stream";
import readline from "readline";
import * as jsdom from "jsdom";
import zlib from "zlib";

import { client } from "src/helper/elastic";
import { Index, LANGUAGE_NAME_TO_ELASTIC_FIELD } from "src/definition/elastic";
import { removeWhiteSpaceFromXML } from "src/helper/xml";
import { downloadDictionary } from "src/helper/dictionary";

export const writeDictionaryToElasticSearch = async () => {
  const dom = new jsdom.JSDOM();
  const domParser = new dom.window.DOMParser();
  const serializer = new dom.window.XMLSerializer();
  const dictionaryGzipFile = `${new Date().getTime()}.gzip`;
  const jsonEntriesFile = `${new Date().getTime()}.json`;
  await downloadDictionary(dictionaryGzipFile);
  const inputStream = fs.createReadStream(dictionaryGzipFile);
  const outputStream = fs.createWriteStream(jsonEntriesFile);
  const readLines = async () => {
    const WORD_SPLIT_REGEX = new RegExp(",|;");
    const lines = readline.createInterface({
      input: fs.createReadStream(jsonEntriesFile),
    });

    let index = 0;

    for await (const line of lines) {
      const { _id, _source } = JSON.parse(line);
      const modifiedXML = removeWhiteSpaceFromXML(_source.xml);
      const xml = serializer.serializeToString(modifiedXML.documentElement);
      const doc = domParser.parseFromString(xml, "application/xml");
      const word = doc.querySelector("item word_info word").textContent;
      const word_grades = [...doc.querySelectorAll("word_grade")].map(
        (element) => element.textContent,
      );
      const translations = {};

      for (const sense of doc.querySelectorAll("sense_info")) {
        for (const translation of sense.querySelectorAll("translation")) {
          const translationWord = translation.querySelector("trans_word")
            .textContent;
          const translationLanguage = translation.querySelector("trans_lang")
            .textContent;
          const field = LANGUAGE_NAME_TO_ELASTIC_FIELD[translationLanguage];

          if (!translations[field]) {
            translations[field] = [];
          }

          const searchTerms = translationWord
            .split(WORD_SPLIT_REGEX)
            .map((word) => word.trim())
            .filter((word) => word.length > 0);

          translations[field].push(...searchTerms);
        }
      }

      if (index % 1000 === 0) {
        console.log(`index = ${index} _id=${_id} word=${word}`);
        console.log("grades", word_grades);
      }

      await client.index({
        id: _id,
        index: Index.entry,
        body: {
          xml,
          word,
          word_grades,
          ...translations,
        },
      });
      index++;
    }

    fs.unlink(jsonEntriesFile, (e) => {
      if (e) {
        console.error(e);
      }
    });
  };

  pipeline(inputStream, zlib.createGunzip(), outputStream, (e) => {
    if (e) {
      console.error(e);
      return;
    }

    readLines();

    fs.unlink(dictionaryGzipFile, (e) => {
      if (e) {
        console.error(e);
      }
    });
  });
};
