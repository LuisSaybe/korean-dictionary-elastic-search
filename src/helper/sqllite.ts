import { LanguageNames } from "src/definition/korean-open-api";

export function insertEntry(db, doc) {
  const target_code = Number(doc.querySelector("item target_code").textContent);
  const word = doc.querySelector("item word_info word").textContent;
  const word_unit = doc.querySelector("item word_unit").textContent;
  const sup_no = doc.querySelector("item word_info sup_no").textContent;
  const pos = doc.querySelector("item word_info pos").textContent;
  const word_type = doc.querySelector("item word_info word_type").textContent;
  const word_grade = doc.querySelector("item word_info word_grade").textContent;
  const pronunciation = doc.querySelector("item word_info pronunciation")
    ?.textContent;
  const conjugations = [...doc.querySelectorAll("conju_info")]
    .filter((node) => node.childElementCount > 0)
    .map((element) => {
      const result: Record<string, string> = {};
      const conjugation = element.querySelector(
        "conjugation_info > conjugation",
      );
      const abbreviation = element.querySelector(
        "abbreviation_info > abbreviation",
      );
      const abbreviationPronunciation = element.querySelector(
        "abbreviation_info > pronunciation_info > pronunciation",
      );

      if (conjugation) {
        result.conjugation_info = conjugation.textContent;
      }

      if (abbreviation) {
        result.abbreviation = abbreviation.textContent;
      }

      if (abbreviationPronunciation) {
        result.abbreviationPronunciation =
          abbreviationPronunciation.textContent;
      }

      return result;
    });

  const conjugationRows = conjugations
    .map((conjugation, index) => [
      target_code,
      index,
      conjugation.conjugation_info,
      conjugation.abbreviation,
      conjugation.abbreviationPronunciation,
    ])
    .map((row) =>
      db.run(
        `
        INSERT INTO conju_info (
        target_code,
        conju_info_index,
        conjugation,
        abbreviation,
        pronunciation
      ) VALUES (?, ?, ?, ?, ?)`,
        row,
      ),
    );

  const entryPromise = db.run(
    `
    INSERT INTO entry (
    target_code,
    word,
    word_unit,
    sup_no,
    word_type,
    pronunciation,
    pos,
    word_grade
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    target_code,
    word,
    word_unit,
    sup_no,
    word_type,
    pronunciation,
    pos,
    word_grade,
  );

  return Promise.all([entryPromise, ...conjugationRows]);
}

function extractTransWordAndDfn(senseDoc, languge: String) {
  for (const translation of senseDoc.querySelectorAll("translation")) {
    if (translation.querySelector("trans_lang").textContent === languge) {
      return [
        translation.querySelector("trans_word").textContent,
        translation.querySelector("trans_dfn").textContent,
      ];
    }
  }

  return [null, null];
}

export function insertSenses(db, doc) {
  const promises = [];
  const target_code = Number(doc.querySelector("item target_code").textContent);

  let sense_index = 0;

  for (const sense of doc.querySelectorAll("item > word_info > sense_info")) {
    const definition = sense.querySelector("definition").textContent;
    const [english_word, english_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.english,
    );
    const [japanese, japanese_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.japanese,
    );
    const [french, french_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.french,
    );
    const [spanish, spanish_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.spanish,
    );
    const [arabic, arabic_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.arabic,
    );
    const [mongolian, mongolian_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.mongolian,
    );
    const [vietnamese, vietnamese_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.vietnamese,
    );
    const [thai, thai_dfn] = extractTransWordAndDfn(sense, LanguageNames.thai);
    const [indonesian, indonesian_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.indonesian,
    );
    const [russian, russian_dfn] = extractTransWordAndDfn(
      sense,
      LanguageNames.russian,
    );
    const future = db.run(
      `INSERT INTO sense_info (
        target_code,
        sense_index,
        definition,
        english_word,
        english_dfn,
        japanese,
        japanese_dfn,
        french,
        french_dfn,
        spanish,
        spanish_dfn,
        arabic,
        arabic_dfn,
        mongolian,
        mongolian_dfn,
        vietnamese,
        vietnamese_dfn,
        thai,
        thai_dfn,
        indonesian,
        indonesian_dfn,
        russian,
        russian_dfn
      ) VALUES (${Array.from(new Array(23))
        .map((_) => "?")
        .join(",")})`,
      target_code,
      sense_index,
      definition,
      english_word,
      english_dfn,
      japanese,
      japanese_dfn,
      french,
      french_dfn,
      spanish,
      spanish_dfn,
      arabic,
      arabic_dfn,
      mongolian,
      mongolian_dfn,
      vietnamese,
      vietnamese_dfn,
      thai,
      thai_dfn,
      indonesian,
      indonesian_dfn,
      russian,
      russian_dfn,
    );
    promises.push(future);
    sense_index++;
  }

  return Promise.all(promises);
}

export function insertExampleInfo(db, doc) {
  const promises = [];
  const target_code = Number(doc.querySelector("item target_code").textContent);

  let sense_index = 0;

  for (const sense of doc.querySelectorAll("item > word_info > sense_info")) {
    let example_info_index = 0;

    for (const example_info of sense.querySelectorAll("example_info")) {
      const type = example_info.querySelector("type").textContent;
      const example = example_info.querySelector("example").textContent;

      const future = db.run(
        `
        INSERT INTO example_info (
            target_code,
            sense_index,
            example_info_index,
            type,
            example
            ) VALUES (${Array.from(new Array(5))
              .map((_) => "?")
              .join(",")}
        )`,
        target_code,
        sense_index,
        example_info_index,
        type,
        example,
      );
      promises.push(future);
      example_info_index++;
    }

    sense_index++;
  }

  return Promise.all(promises);
}

export function createTables(db) {
  return Promise.all([
    db.exec(`
    CREATE TABLE entry (
      target_code INTEGER PRIMARY KEY,
      word TEXT NOT NULL,
      sup_no INTEGER NOT NULL,
      word_unit TEXT NOT NULL,
      pos TEXT NOT NULL,
      word_type TEXT NOT NULL,
      pronunciation TEXT,
      word_grade TEXT NOT NULL
    ) WITHOUT ROWID;
    CREATE INDEX entry_word_grade_index ON entry (word_grade);
    `),
    db.exec(`
    CREATE TABLE sense_info (
      target_code INTEGER NOT NULL,
      sense_index INTEGER NOT NULL,
      definition TEXT NOT NULL,
      english_word TEXT,
      english_dfn TEXT,
      japanese TEXT,
      japanese_dfn TEXT,
      french TEXT,
      french_dfn TEXT,
      spanish TEXT,
      spanish_dfn TEXT,
      arabic TEXT,
      arabic_dfn TEXT,
      mongolian TEXT,
      mongolian_dfn TEXT,
      vietnamese TEXT,
      vietnamese_dfn TEXT,
      thai TEXT,
      thai_dfn TEXT,
      indonesian TEXT,
      indonesian_dfn TEXT,
      russian TEXT,
      russian_dfn TEXT,
      PRIMARY KEY (target_code, sense_index)
    ) WITHOUT ROWID;
    CREATE INDEX sense_info_target_code_index ON sense_info (target_code);
    `),
    db.exec(`
    CREATE TABLE example_info (
      target_code INTEGER NOT NULL,
      sense_index INTEGER NOT NULL,
      example_info_index INTEGER NOT NULL,
      type TEXT NOT NULL,
      example TEXT NOT NULL,
      PRIMARY KEY (target_code, sense_index, example_info_index)
    ) WITHOUT ROWID;
    CREATE INDEX example_info_target_code_index ON example_info (target_code);
    `),
    ,
    db.exec(`
    CREATE TABLE conju_info (
      target_code INTEGER NOT NULL,
      conju_info_index INTEGER NOT NULL,
      conjugation TEXT,
      abbreviation TEXT,
      pronunciation TEXT,
      PRIMARY KEY (target_code, conju_info_index)
    ) WITHOUT ROWID;
    CREATE INDEX conju_info_target_code_index ON conju_info (target_code);
    `),
  ]);
}
