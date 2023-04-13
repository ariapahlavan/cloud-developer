import { TodosAcess } from './todosAcess'
import { createUploadUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'


const logger = createLogger('Todos');
const todosAccess = new TodosAcess();
const attachmentBucketName = process.env.ATTACHMENT_S3_BUCKET;

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  logger.info(`Getting todos for a user: ${userId}`);
  return todosAccess.getTodosByUserId(userId);
}

export const createTodo = async (request: CreateTodoRequest, userId: string): Promise<TodoItem> => {
  logger.info(`Creating a new todo from request: ${request}, for user: ${userId}`);

  const newItem: TodoItem = {
    createdAt: new Date().toISOString(),
    userId: userId,
    todoId: uuid.v4(),
    done: false,
    ...request
  }

  return await todosAccess.createTodo(newItem);
}

const validateExistingTodoItem = async (todoId: string, userId: string) => {
  const existingTodo = await todosAccess.getTodoById(todoId);
  if (!existingTodo) {
    throw createError(404, `TODO with id ${todoId} was not found`);
  }

  if (existingTodo.userId !== userId) {
    throw createError(403, `User is forbidden to access TODO item with id ${todoId}`);
  }
}

export const updateTodo = async (
  todoId: string,
  userId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> => {
  await validateExistingTodoItem(todoId, userId);
  await todosAccess.updateTodoById(todoId, updatedTodo);
}

export const deleteTodo = async (todoId: string, userId: string) => {
  await validateExistingTodoItem(todoId, userId);
  await todosAccess.deleteTodoById(todoId);
}

export const createAttachmentPresignedUrl = async (todoId: string, userId: string): Promise<string> => {
  await validateExistingTodoItem(todoId, userId);
  const attachmentUrl: string = `https://${attachmentBucketName}.s3.amazonaws.com/${todoId}`;
  await todosAccess.addTodoAttachmentById(todoId, attachmentUrl)

  return createUploadUrl(todoId, attachmentBucketName);
}
