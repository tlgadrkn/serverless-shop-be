import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEventV2,
} from 'aws-lambda'

const unauthorized = 'Unauthorized'

const basicAuthorizer = async (event: APIGatewayRequestAuthorizerEventV2) => {
  console.log(event)
  const authHeader = event.headers['authorization']
  if (!authHeader) {
    throw new Error(unauthorized)
  }
  if (!authHeader.startsWith('Basic ')) {
    throw new Error(unauthorized)
  }

  const token = authHeader.split(' ')[1]

  const decodedCredentials = Buffer.from(token, 'base64').toString()

  const [username, password] = decodedCredentials.split(':')

  if (!username || !password) throw new Error(unauthorized)

  const validPassword = process.env[username]

  const passwordValid = validPassword === password

  if (passwordValid) {
    return generatePolicy(username, 'Allow', event.routeArn)
  } else {
    return generatePolicy(username, 'Deny', event.routeArn)
  }
}

function generatePolicy(
  prinicpal,
  effect: 'Allow' | 'Deny',
  resource,
): APIGatewayAuthorizerResult {
  return {
    principalId: prinicpal,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  }
}

export const main = basicAuthorizer
