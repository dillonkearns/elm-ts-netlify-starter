const Ajv = require("ajv").default;
const ajv = new Ajv({ removeAdditional: 'all' });
const validators = require('./schema.js')

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
  const parsedEventBody = event.body && JSON.parse(event.body)
  /** @type {import("./generated").MsgHandler<any, unknown> | null} */
  const msgHandler = msg && msg in handlers && handlers[msg];
  const msgValidator = msg && msg in validators && validators[msg]
  if (msgHandler) {
    const validateRequest = ajv.compile(msgValidator.request)
    const validatedEventBody = validateRequest(parsedEventBody)
    if (validatedEventBody) {
      const validatedEvent = {
        ...event,
        body: parsedEventBody,
      };
      const rawResponse = await msgHandler(validatedEvent);
      return responseToJson(ajv.compile(msgValidator.response), rawResponse);
    } else {
      return {
        statusCode: 422,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({errorMessage: validateRequest.errors})
      }
    }
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
 * @param {import("ajv").ValidateFunction<unknown>} validateResponse
 */
function responseToJson(validateResponse, response) {
  const responseBody = response.body
  const validatedResponseBody = validateResponse(responseBody)
  console.log({validatedResponseBody, parsedResponseBody: responseBody});
  if (validatedResponseBody) {
    const headers = {
      ...(response.headers || {}),
      "Content-Type": "application/json",
    };
    return { ...response, headers, body: JSON.stringify(responseBody) };
  } else {


      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({errorMessage: validateResponse.errors})
      }
  }
}
