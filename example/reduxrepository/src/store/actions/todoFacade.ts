import { UnitOfWork } from '@/src/services/UnitOfWork';

export const getTodo = async () => {
  await UnitOfWork.instance.todoService.all('SETTITLE');
};
