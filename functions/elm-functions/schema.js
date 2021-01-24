// @ts-check
/** @typedef {import('ajv').JSONSchemaType<any>} JsonSchema */
/** @type {{ [key: string]: { request: JsonSchema; response: JsonSchema; }}} */
module.exports = {
    hello: {
        request: {
            type: 'object',
            properties: {
                name: {
                    type: 'string'
                }
            },
            required: ['name']

        }, response: {
            type: 'object',
            properties: {
                message: {
                    type: 'string'
                    }
            },
            required: ['message']
        }

    }
}