import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {formatJSONResponse} from '@libs/api-gateway'
import {middyfy} from '@libs/lambda'
import {APIGatewayProxyEvent} from 'aws-lambda'

const client = new S3Client({region: process.env.REGION})

export const importProductsFile = async (event: APIGatewayProxyEvent) => {
  console.log(event)
  const fileName = event.queryStringParameters?.name

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `uploaded/${fileName}`,
      Body: event.body,
      ContentType: 'text/csv',
    })

    const returnedSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    })

    console.log('SIGNED URL', returnedSignedUrl)

    return formatJSONResponse({
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      message: 'Signed URL generated',
      body: returnedSignedUrl,
    })
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    }
  }
}

export const main = middyfy(importProductsFile)
