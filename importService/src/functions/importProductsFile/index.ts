import {handlerPath} from '@libs/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/import',
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
      },
    },
  ],
  environment: {
    REGION: process.env.REGION,
    BUCKET_NAME: process.env.BUCKET_NAME,
  },
}
