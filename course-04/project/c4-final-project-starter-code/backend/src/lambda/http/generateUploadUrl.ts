import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing request param: todoId'
        })
      }
    }
    const userId: string = getUserId(event);
    const uploadUrl = await createAttachmentPresignedUrl(todoId, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
