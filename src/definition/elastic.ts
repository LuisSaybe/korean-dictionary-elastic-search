import { LanguageNames } from "src/definition/korean-open-api";
export enum EntryField {
  xml = "xml",
  word = "word",
  senses = "senses",
  englishTranslationWord = "englishTranslationWord",
  japaneseTranslationWord = "japaneseTranslationWord",
  frenchTranslationWord = "frenchTranslationWord",
  spanishTranslationWord = "spanishTranslationWord",
  arabicTranslationWord = "arabicTranslationWord",
  mongolianTranslationWord = "mongolianTranslationWord",
  vietnameseTranslationWord = "vietnameseTranslationWord",
  thaiTranslationWord = "thaiTranslationWord",
  indonesianTranslationWord = "indonesianTranslationWord",
  russianTranslationWord = "russianTranslationWord",
}

export enum Index {
  entry = "entry",
}

export const LANGUAGE_NAME_TO_ELASTIC_FIELD = {
  [LanguageNames.english]: EntryField.englishTranslationWord,
  [LanguageNames.japanese]: EntryField.japaneseTranslationWord,
  [LanguageNames.french]: EntryField.frenchTranslationWord,
  [LanguageNames.spanish]: EntryField.spanishTranslationWord,
  [LanguageNames.arabic]: EntryField.arabicTranslationWord,
  [LanguageNames.mongolian]: EntryField.mongolianTranslationWord,
  [LanguageNames.vietnamese]: EntryField.vietnameseTranslationWord,
  [LanguageNames.thai]: EntryField.thaiTranslationWord,
  [LanguageNames.indonesian]: EntryField.indonesianTranslationWord,
  [LanguageNames.russian]: EntryField.russianTranslationWord,
};
