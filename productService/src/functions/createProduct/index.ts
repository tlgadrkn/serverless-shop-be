import {handlerPath} from '@libs/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/products',
        cors: true,
      },
    },
  ],
  environment: {
    PRODUCTS_TABLE: process.env.PRODUCTS_TABLE,
    STOCKS_TABLE: process.env.STOCKS_TABLE,
  },
}
