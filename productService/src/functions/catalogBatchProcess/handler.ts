import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from '@aws-sdk/client-sns'
import {SQSEvent} from 'aws-lambda'
import createErrorResponse, {formatJSONResponse} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'
import {createProduct, createProductInDB} from '../createProduct/handler'

const snsClient = new SNSClient({region: process.env.REGION})

export const catalogBatchProcess = async (event: SQSEvent) => {
  let hasOutOfStockItems = false
  const productIds = []

  try {
    console.log('catalogBatchProcess Lambda: ', event)

    for (const productData of event.Records) {
      const product = JSON.parse(productData.body)
      const id = await createProductInDB(product)
      productIds.push(id)
      if (!hasOutOfStockItems && product.count === 0) {
        hasOutOfStockItems = true
      }
    }
    await notifySubscribers(productIds, hasOutOfStockItems)
  } catch (error) {
    console.log('catalogBatchProcess Lambda error: ', error)

    return formatJSONResponse(
      {
        body: error.message,
      },
      500,
    )
  }
}

const notifySubscribers = async (
  productIds: string[],
  hasOutOfStockItems: boolean,
) => {
  const command: PublishCommandInput = {
    TopicArn: process.env.SNS_ARN,
    Subject: 'Product update',
    Message: `Products with ids: ${JSON.stringify(
      productIds,
    )} processed successfully`,
    MessageAttributes: {
      outOfStock: {
        DataType: 'String',
        StringValue: hasOutOfStockItems ? 'yes' : 'no',
      },
    },
  }
  await snsClient.send(new PublishCommand(command))
}

export const main = middyfy(catalogBatchProcess)
