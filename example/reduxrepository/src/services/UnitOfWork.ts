// new service import placeholder
import { TodoRepository } from '@/src/repositories/concretes/TodoRepository';
import { TodoService } from '@/src/services/TodoService';
import { Store } from 'redux';
import { AppState } from '../models/AppState';

export class UnitOfWork {
    public store: Store<AppState>;

    // new service placeholder
    todoService: TodoService

    public static instance: UnitOfWork;

    public static init(store: Store) {
      UnitOfWork.instance = new UnitOfWork(store);
    }

    private constructor(store: Store<AppState>) {
      this.store = store;

      // new service init placeholder
      this.todoService = new TodoService(TodoRepository);
    }
}
