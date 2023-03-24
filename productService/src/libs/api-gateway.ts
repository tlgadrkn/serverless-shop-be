import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda'
import type {FromSchema} from 'json-schema-to-ts'

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & {
  body: FromSchema<S>
}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const formatJSONResponse = (
  response: Record<string, unknown>,
  statusCode?: number,
) => {
  return {
    headers,
    statusCode: statusCode || 200,
    body: JSON.stringify(response.body),
  }
}
export const createErrorResponse = (statusCode, message) => ({
  statusCode,
  headers,
  body: JSON.stringify({
    error: message,
  }),
})

export default createErrorResponse
