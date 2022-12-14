// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;
console.info('SAMPLE_TABLE ' + tableName);

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const isLocalDynamoDB = process.env.LOCAL_DYNAMODB;
console.info('LOCAL_DYNAMODB ' + isLocalDynamoDB);
const localDynanoDBConfig = {
    endpoint: 'http://host.containers.internal:4566',
    region: 'eu-central-1'
}
const docClient = isLocalDynamoDB === "true" ? new dynamodb.DocumentClient(localDynanoDBConfig) : new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    const params = {
      TableName : tableName,
      Key: { id: id },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;
   
    response = {
      statusCode: 200,
      body: JSON.stringify(item)
    };
  } catch (error) {
    response = {
        statusCode: 500,
        body: JSON.stringify(error)
    };
}
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
