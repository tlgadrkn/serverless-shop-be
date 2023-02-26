import type {AWS} from '@serverless/typescript'

import {getProductsList, getProductsById} from '@functions/index'
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
    },
  },
  functions: {getProductsList, getProductsById},
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
  },
}

module.exports = serverlessConfiguration
