export const Notifications = {
  Notifications: {
    Type: 'AWS::SNS::Topic',
  },
  EmailSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      TopicArn: {'Fn::GetAtt': ['Notifications', 'TopicArn']},
      Protocol: 'email',
      Endpoint: 'farafonoff@gmail.com',
    },
  },
  FailedMessageEmailSubscription: {
    Type: 'AWS::SNS::Subscription',
    Properties: {
      FilterPolicyScope: 'MessageAttributes',
      FilterPolicy: {batchSize: [{numeric: ['>=', 5]}]},
      TopicArn: {'Fn::GetAtt': ['Notifications', 'TopicArn']},
      Protocol: 'email',
      Endpoint: 'tolga.durukann@gmail.com',
    },
  },
}
