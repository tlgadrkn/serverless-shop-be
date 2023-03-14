import {APIGatewayProxyEvent} from 'aws-lambda'
import createErrorResponse, {formatJSONResponse} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'
import DynamoDB from 'aws-sdk/clients/dynamodb'
const docClient = new DynamoDB.DocumentClient()

export const getProductsById = async (event: APIGatewayProxyEvent) => {
  try {
    console.log('getProductsById Lambda: ', event)
    const id = event.pathParameters.productId

    const params = {
      TableName: process.env.PRODUCTS_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {':id': id},
    }

    const productData = await docClient.query({...params}).promise()

    if (!productData.Items[0]) {
      return createErrorResponse(404, `Product with ${id} not found.`)
    }

    const stockData = await docClient
      .query({
        TableName: process.env.STOCKS_TABLE,
        KeyConditionExpression: 'product_id = :product_id',
        ExpressionAttributeValues: {':product_id': id},
      })
      .promise()

    const data = {...productData.Items[0], count: stockData?.Items[0]?.count}

    return formatJSONResponse({
      body: data,
    })
  } catch (error) {
    return formatJSONResponse(
      {
        body: error.message,
      },
      500,
    )
  }
}

export const main = middyfy(getProductsById)
