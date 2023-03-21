import {handlerPath} from '@libs/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    TOPIC_ARN: {'Fn::GetAtt': ['Notifications', 'TopicArn']},
  },
  events: [
    {
      sqs: {
        arn: {'Fn::GetAtt': ['CatalogItemsQueue', 'Arn']},
        batchSize: 5,
        enabled: true,
      },
    },
  ],
}
