import { ITodoRepository } from '@/src/repositories/interfaces/ITodoRepository';
import { Todo } from '@/src/models/Todo';
import { BaseService } from 'js-frontend-repository/BaseSerivce';

export class TodoService extends BaseService<Todo, ITodoRepository> {
}
