import {formatJSONResponse} from '../../libs/api-gateway'
import {middyfy} from '../../libs/lambda'
import {data} from '../../mocks/mock'

export const getProductsList = async () => {
  try {
    return formatJSONResponse({body: data})
  } catch (error) {
    return formatJSONResponse({body: error}, 500)
  }
}

export const main = middyfy(getProductsList)
