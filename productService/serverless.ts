import type {AWS} from '@serverless/typescript'
import {getProductsList, getProductsById, createProduct} from '@functions/index'
import {CatalogItemsQueueResource} from './resources/sqs'
import {Notifications} from './resources/notifications'

const serverlessConfiguration: AWS = {
  service: 'productservice',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-esbuild',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-2',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      // PRODUCTS_TABLE: process.env.PRODUCT_TABLE,
      // STOCKS_TABLE: process.env.STOCKS_TABLE,
      region: '${self:provider.region}',
      PRODUCTS_TABLE: 'products',
      STOCKS_TABLE: 'stocks',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:DeleteItem',
            ],
            Resource:
              'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.PRODUCTS_TABLE}',
          },
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:DeleteItem',
            ],
            Resource:
              'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.STOCKS_TABLE}',
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:SendMessage',
              'sqs:ReceiveMessage',
              'sqs:DeleteMessage',
              'sqs:GetQueueUrl',
              'sqs:ListQueues',
              'sqs:CreateQueue',
              'sqs:DeleteQueue',
            ],
            Resource: 'arn:aws:sqs:${self:provider.region}:*',
          },
        ],
      },
    },
  },
  functions: {getProductsList, getProductsById, createProduct},
  package: {individually: true},
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
    },
    autoswagger: {
      apiType: 'http',
      generateSwaggerOnDeploy: true,
      schemes: ['http', 'https'],
      excludeStages: ['production', 'anyOtherStage'],
    },
    resources: {
      Resources: {
        ProductsTable: {
          Type: 'AWS::DynamoDB::Table',
          Properties: {
            TableName: '${self:provider.environment.PRODUCTS_TABLE}',
            AttributeDefinitions: [
              {
                AttributeName: 'id',
                AttributeType: 'S',
              },
            ],
            KeySchema: [
              {
                AttributeName: 'id',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'title',
                KeyType: 'RANGE',
              },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1,
            },
          },
        },
        StocksTable: {
          Type: 'AWS::DynamoDB::Table',
          Properties: {
            TableName: '${self:provider.environment.STOCKS_TABLE}',
            AttributeDefinitions: [
              {
                AttributeName: 'product_id',
                AttributeType: 'S',
              },
            ],
            KeySchema: [
              {
                AttributeName: 'product_id',
                KeyType: 'HASH',
              },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1,
            },
          },
        },
        ...CatalogItemsQueueResource,
        ...Notifications,
      },
    },
  },
}

module.exports = serverlessConfiguration
