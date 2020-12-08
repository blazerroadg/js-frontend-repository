// new service import placeholder
import { TodoRepository } from '@/src/repositories/concretes/TodoRepository';
import { TodoService } from '@/src/services/TodoService';

export class UnitOfWork {
  // new service placeholder
todoService: TodoService

    private static innerInstance: UnitOfWork;

    public static instance(): UnitOfWork {
      if (!UnitOfWork.innerInstance) {
        UnitOfWork.innerInstance = new UnitOfWork();
      }
      return UnitOfWork.innerInstance;
    }

    private constructor() {
      // new service init placeholder
      this.todoService = new TodoService(TodoRepository);
    }
}
