import createErrorResponse, {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import {v4} from 'uuid'
import Schema from './schema'
import {z} from 'zod'

const docClient = new DynamoDB.DocumentClient()
const ProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
})

export const createProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof Schema
> = async (event) => {
  try {
    console.log('createProduct Lambda: ', event)
    const requestBody = event.body
    const parseResult = ProductSchema.safeParse(requestBody)

    if (!parseResult.success) {
      return createErrorResponse(400, `Bad request, request body is not valid`)
    }

    const product = {
      ...requestBody,
      id: v4() as string,
      image: 'https://picsum.photos/200',
    }

    // const params = {
    //   TransactItems: [
    //     {
    //       Put: {
    //         TableName: process.env.PRODUCTS_TABLE,
    //         Item: {
    //           ...product,
    //         },
    //       },
    //     },
    //     {
    //       Put: {
    //         TableName: process.env.STOCKS_TABLE,
    //         Item: {
    //           product_id: product.id,
    //           count: product.count || 1,
    //         },
    //       },
    //     },
    //   ],
    // }
    const result = createProductInDB(product)

    return formatJSONResponse(
      {
        body: `item created ${result}`,
      },
      201,
    )
  } catch (error) {
    return formatJSONResponse(
      {
        body: error,
      },
      500,
    )
  }
}

export const createProductInDB = async (product) => {
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE,
          Item: {
            ...product,
          },
        },
      },
      {
        Put: {
          TableName: process.env.STOCKS_TABLE,
          Item: {
            product_id: product.id,
            count: product.count || 1,
          },
        },
      },
    ],
  }
  const result = await docClient.transactWrite(params).promise()

  return result
}

export const main = middyfy(createProduct)
