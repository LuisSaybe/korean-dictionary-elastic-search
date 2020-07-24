import request from "request-promise-native";

const VIEW_URL = "https://krdict.korean.go.kr/api/view";
const timeout = 60000;

const get = (uri, qs) =>
  request({
    qs: {
      key: process.env.DICTIONARY_API_KEY,
      ...qs,
    },
    timeout,
    uri,
  });

export const getDefinition = async (q) => {
  return get(VIEW_URL, {
    method: "target_code",
    q,
    trans_lang: 0,
    translated: "y",
  });
};
