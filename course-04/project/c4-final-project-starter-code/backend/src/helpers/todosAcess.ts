import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAcess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable: string = process.env.TODOS_TABLE,
    private readonly todosTableIndex: string = process.env.TODOS_CREATED_AT_INDEX,
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos for user: ${userId}`);

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosTableIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }).promise();

    return result.Items as TodoItem[];
  }

  async createTodo(newItem: TodoItem): Promise<TodoItem> {
    logger.info(`Creating a new todo: ${JSON.stringify(newItem)}`);

    await this.docClient.put({
      TableName: this.todosTable,
      Item: newItem
    }).promise();

    return newItem;
  }

  async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: { todoId, userId }
    }).promise()

    return result.Item ? result.Item as TodoItem : undefined;
  }

  async updateTodoById(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set #nameattr = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: { '#nameattr': 'name' },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
    }).promise()
  }

  async addTodoAttachmentById(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: { ':attachmentUrl': attachmentUrl },
    }).promise()
  }

  async deleteTodoById(todoId: string, userId: string): Promise<void> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: { todoId, userId }
    }).promise();
  }
}
