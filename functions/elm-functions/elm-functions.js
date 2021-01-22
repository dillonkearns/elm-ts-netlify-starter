// @ts-check

const { getHandler } = require("./generated.js");

/** @type {import("./generated").MsgHandlers} */
const reqs = {
  hello,
  weather,
};

/** @type {import("./generated").MsgHandlers.hello} */
async function hello(event) {
  return {
    statusCode: 200,
    body: { message: `Hello!!!!`},
  };
}

/** @type {import("./generated").MsgHandlers.weather} */
async function weather(event) {
  return {
    statusCode: 200,
    body: { degrees: 123 },
  };
}
/**
 * @param {string} unit
 * @returns {Promise<{degrees: number}>}
 */
async function getWeather(unit) {
  return { degrees: 123 };
}

exports.handler = getHandler(reqs);
