import { ITodoRepository } from '@/src/repositories/interfaces/ITodoRepository';
import { Todo } from '@/src/models/Todo';
import { BaseReduxService } from 'react-redux-repository/BaseReduxService';

export class TodoService extends BaseReduxService<Todo, ITodoRepository> {
}
