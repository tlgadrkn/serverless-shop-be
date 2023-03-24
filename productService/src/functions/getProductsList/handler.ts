import {APIGatewayProxyEvent} from 'aws-lambda'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import {formatJSONResponse} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'

const docClient = new DynamoDB.DocumentClient()

export const getProductsList = async (event: APIGatewayProxyEvent) => {
  console.log('getProductsList Lambda: ', event)

  try {
    const products = await docClient
      .scan({
        TableName: process.env.PRODUCTS_TABLE,
      })
      .promise()

    if (products.Count > 0) {
      const stocks = await docClient
        .scan({
          TableName: process.env.STOCKS_TABLE,
        })
        .promise()

      const items = products.Items.map((item) => {
        const stockEquivelant = stocks.Items.find(
          (stock) => stock.product_id === item.id,
        )

        return {...item, count: stockEquivelant.count}
      })

      return formatJSONResponse({body: items})
    }
  } catch (error) {
    return formatJSONResponse({body: error}, 500)
  }
}

export const main = middyfy(getProductsList)
