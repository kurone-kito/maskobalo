import type { ProxyHandler } from 'aws-lambda';

export const hello: ProxyHandler = async () => ({
  body: JSON.stringify({ message: 'Hello, world!' }),
  statusCode: 200,
});
