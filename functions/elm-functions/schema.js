// @ts-check
/** @typedef {import('ajv').JSONSchemaType<any>} JsonSchema */
/** @type {{ [key: string]: { request: JsonSchema; response: JsonSchema; }}} */
module.exports = {
  "hello": {"request":{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  },
  "required": [
    "name"
  ]
},"response":{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "message": {
      "type": "string"
    }
  },
  "required": [
    "message"
  ]
}},
  "weather": {"request":{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "unit": {
      "anyOf": [
        {
          "const": "C"
        },
        {
          "const": "F"
        }
      ]
    }
  },
  "required": [
    "unit"
  ]
},"response":{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "degrees": {
      "type": "integer"
    }
  },
  "required": [
    "degrees"
  ]
}}
}
