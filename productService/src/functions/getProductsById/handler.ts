import {formatJSONResponse} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'
import {data} from '../../mocks/mock'

export const getProductsById = async (event) => {
  try {
    const id = event.pathParameters.productId
    const filteredProduct = data.find((item) => item.id === id)
    if (!filteredProduct) {
      return formatJSONResponse(
        {
          body: `Product with ${id} not found.`,
        },
        404,
      )
    }
    return formatJSONResponse({
      body: filteredProduct,
    })
  } catch (error) {
    return formatJSONResponse(
      {
        body: error,
      },
      500,
    )
  }
}

export const main = middyfy(getProductsById)
