import {getProductsById} from './handler'
import * as mockData from '../../mocks/mock'
describe('getProductById lambda', () => {
  it('should return correct data', async () => {
    const data = await getProductsById({
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      },
    })
    expect(data.statusCode).toEqual(200)
    expect(JSON.parse(data.body)).toEqual(mockData.data[0])
  })
  it('should throw 404 error when product with given productId doesnt exist', async () => {
    const data = await getProductsById({
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-bfc73c48a8',
      },
    })
    expect(data.statusCode).toEqual(404)
    expect(JSON.parse(data.body)).toEqual(
      `Product with 7567ec4b-b10c-48c5-9345-bfc73c48a8 not found.`,
    )
  })
})
