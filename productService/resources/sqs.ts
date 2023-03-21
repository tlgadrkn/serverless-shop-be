export const CatalogItemsQueueResource = {
  CatalogItemsQueue: {
    Type: 'AWS::SQS::Queue',
    Properties: {
      RedrivePolicy: {
        deadLetterTargetArn: {
          'Fn::GetAtt': ['CatalogItemsQueueDLQ', 'Arn'],
        },
        maxReceiveCount: 3,
      },
    },
    CatalogItemsQueueDLQ: {
      Type: 'AWS::SQS::Queue',
    },
    CatalogItemsQueuePath: {
      Type: 'AWS::SSM::Parameter',
      Properties: {
        Name: 'CatalogItemsQueue',
        Type: 'String',
        Value: {'Fn::GetAtt': ['CatalogItemsQueue', 'QueueUrl']},
      },
    },
  },
  CreateProductTopic: {
    Type: 'AWS::SNS::Topic',
    Properties: {
      TopicName: 'createProductTopic',
    },
  },
  CreateProductInStockSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      TopicArn: {
        Ref: 'CreateProductTopic',
      },
      Endpoint: 'tolga.durukann@gmail.com',
      Protocol: 'email',
    },
  },
  CreateProductOutOfStockSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      TopicArn: {
        Ref: 'CreateProductTopic',
      },
      Endpoint: 'tolga.durukann@gmail.com',
      Protocol: 'email',
      FilterPolicy: {
        outOfStock: ['yes'],
      },
    },
  },
}
