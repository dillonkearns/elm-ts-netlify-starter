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


/** @typedef {{kind: 'NoMsgParam'} | {kind: 'NoMsgHandler'; msgName: string;} | {kind: 'RequestBodyValidationFailed'; msg: string; errors: import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | null | undefined} | {kind: 'ResponseBodyValidationFailed';errors: import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | null | undefined} | {kind: 'MissingMsgHandler'; msgName: string;}} MsgError */

/**
 * @param {MsgError} error
 * @returns {Promise<AWSLambda.APIGatewayProxyStructuredResultV2>}
 */
const errorHandler =
 async function(error) {
   switch (error.kind) {
     case "NoMsgParam": {
      return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({errorMessage: "I expected a query parameter named 'msg'."})
      }
    }
    case "NoMsgHandler": {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorMessage: `Function for msg '${error.msgName}' not found.`,
        }),
      };
    }
    case "RequestBodyValidationFailed": {
      return {
        statusCode: 422,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ errorMessage: error.errors }),
      };
    }
    case "ResponseBodyValidationFailed": {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ errorMessage: error.errors }),
      };
    }
    case "MissingMsgHandler": {
      return {
        statusCode: 500,
        body: JSON.stringify({
          errorMessage: `Couldn't find a msg handler for ${error.msgName}.`,
        }),
      };
    }
   }
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
  if (!msg) {
    return await errorHandler({kind: 'NoMsgParam'})
  }
  /** @type {import("./generated").MsgHandler<any, unknown> | null} */
  // @ts-ignore
  const msgHandler = msg && msg in handlers && handlers[msg];
  const msgValidator = msg && msg in validators && validators[msg]
  if (!msgValidator) {
    return await errorHandler({kind: 'NoMsgHandler', msgName: msg})
  }
  if (msgHandler) {
    const validateRequest = ajv.compile(msgValidator.request)
    const validatedEventBody = validateRequest(parsedEventBody)
    if (validatedEventBody) {
      const validatedEvent = {
        ...event,
        body: parsedEventBody,
      };
      // @ts-ignore
      const rawResponse = await msgHandler(validatedEvent, context);
      return await responseToJson(ajv.compile(msgValidator.response), rawResponse);
    } else {
      return await errorHandler({kind: 'RequestBodyValidationFailed', msg: msg, errors: validateRequest.errors})
    }
  } else {
      return await errorHandler({kind: 'MissingMsgHandler', msgName: msg})
  }
}

/**
 * @param {import("./generated").Response<unknown>} response
 * @param {import("ajv").ValidateFunction<unknown>} validateResponse
 * @returns {Promise<import("./generated").APIGatewayProxyStructuredResultV2>}
 */
async function responseToJson(validateResponse, response) {
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
      return await errorHandler({kind: 'ResponseBodyValidationFailed', errors: validateResponse.errors})
  }
}
