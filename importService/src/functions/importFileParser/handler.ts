import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import {formatJSONResponse} from '@libs/api-gateway'
import {middyfy} from '@libs/lambda'
import {S3Event} from 'aws-lambda'
import csvParser from 'csv-parser'

import {Readable} from 'stream'

const client = new S3Client({region: process.env.REGION})

const importFileParser = async (event: S3Event) => {
  console.log(event)

  try {
    event.Records.forEach(async (record) => {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: record.s3.object.key,
      }
      const command = new GetObjectCommand(params)
      const res = await client.send(command)

      return new Promise((resolve, reject) => {
        if (!(res.Body instanceof Readable)) {
          throw new Error('Stream is not readable')
        }

        res.Body.pipe(csvParser())
          .on('data', (data) => console.log('DATA:', data))
          .on('error', (error) => reject(error))
          .on('end', async () => {
            console.log('successfully parsed')

            await client.send(
              new CopyObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                CopySource: `${process.env.BUCKET_NAME}/${record.s3.object.key}`,
                Key: record.s3.object.key.replace('uploaded', 'parsed'),
              }),
            )
            console.log('copied successfully')

            await client.send(
              new DeleteObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: record.s3.object.key,
              }),
            )
            console.log('deleted successfully')

            resolve()
          })
      })
    })

    return formatJSONResponse({
      message: 'File parsed',
    })
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: error.message,
      }),
    }
  }
}

export const main = middyfy(importFileParser)
