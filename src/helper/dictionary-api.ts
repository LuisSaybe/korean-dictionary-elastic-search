import request from "request-promise-native";

const VIEW_URL = "https://krdict.korean.go.kr/api/view";
const timeout = 3 * 60 * 1000;

export const getDefinition = (q) => {
  return request({
    qs: {
      key: process.env.DICTIONARY_API_KEY,
      method: "target_code",
      q,
      trans_lang: 0,
      translated: "y",
    },
    timeout,
    uri: VIEW_URL,
  });
};
