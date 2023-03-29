import type {AWS} from '@serverless/typescript'

import importProductsFile from '@functions/importProductsFile'
import importFileParser from '@functions/importFileParser'

const serverlessConfiguration: AWS = {
  service: 'importService',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-esbuild',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
  useDotenv: true,
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
      region: '${self:provider.region}',
      BUCKET_NAME: 'importservicebucket',
    },

    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
            Resource: `arn:aws:s3:::importservicebucket/*`,
          },
          {
            Effect: 'Allow',
            Action: ['s3:ListBucket'],
            Resource: `arn:aws:s3:::importservicebucket/*`,
          },
        ],
      },
    },
  },
  functions: {importProductsFile, importFileParser},
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
      schemes: ['http'],
      excludeStages: ['production', 'anyOtherStage'],
    },
    resources: {
      Resources: {
        S3Bucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: 'importservicebucket',
          },
        },
      },
    },
    authorizers: {
      myBasicAuthorizer: {
        type: 'request',
        functionArn:
          '${cf:authorization-service-${sls:stage}.BasicAuthorizerLambdaFunctionQualifiedArn}',
      },
    },
  },
}

module.exports = serverlessConfiguration
