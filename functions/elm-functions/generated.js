/**
 * @param {import("./generated").MsgHandlers} handlers
 * @returns {(event: import("./generated").APIGatewayProxyEvent, context: unknown) => Promise<import("./generated").APIGatewayProxyStructuredResultV2>}
 */
module.exports = { getHandler };

/**
 * @param {import("./generated").MsgHandlers} handlers
 * @returns {(event: AWSLambda.APIGatewayProxyEvent, context: unknown) => Promise<AWSLambda.APIGatewayProxyStructuredResultV2>}

 */
function getHandler(handlers) 
 {
  return ( (event, context) => handle(handlers, event, context))
}

/**
 * @param {import("./generated").MsgHandlers} handlers
 * @param {import("./generated").APIGatewayProxyEvent} event
 * @param {unknown} context
 * @returns {Promise<import("./generated").APIGatewayProxyStructuredResultV2>}
 */
async function handle(handlers, event, context) {
  const msg = event.queryStringParameters?.msg;
  const parsedEvent = {
    ...event,
    body: event.body && JSON.parse(event.body),
  };
  /** @type {import("./generated").MsgHandler<any, unknown> | null} */
  const msgHandler = msg && msg in handlers && handlers[msg];
  if (msgHandler) {
    const rawResponse = await msgHandler(parsedEvent);
    return responseToJson(rawResponse);
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage: `Couldn't find a msg handler for ${msg}.`,
      }),
    };
  }
}

/**
 * @param {import("./generated").Response<unknown>} response
 * @returns {import("./generated").APIGatewayProxyStructuredResultV2}
 */
function responseToJson(response) {
  return { ...response, body: JSON.stringify(response.body) };
}
