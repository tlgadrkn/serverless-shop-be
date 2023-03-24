import {getProductsList} from './handler'
import * as mockData from '../../mocks/mock'
describe('getProductList lambda', () => {
  it('should return data', async () => {
    const data = await getProductsList()
    expect(data.statusCode).toEqual(200)
    expect(JSON.parse(data.body)).toEqual(mockData.data)
  })
})
