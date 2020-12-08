import { FirestoreRepository } from 'react-native-firesotre-repository/FirestoreRepository';
import { Todo } from '@/src/models/Todo';
import { FirestoreEntityMetaData } from 'react-native-firesotre-repository/FirestoreEntityMetaData';
import { FirestoreEntityMetaDataContext } from 'react-native-firesotre-repository/FirestoreEntityMetaDataContext';

export class TodoRepository extends FirestoreRepository<Todo> {
  constructor() {
    super(Todo, new FirestoreEntityMetaData(new FirestoreEntityMetaDataContext()));
  }
}
