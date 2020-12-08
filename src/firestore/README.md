# react-native-firesotre-repository
This package provides the base Repository class to fetch data from Firestore.

For more information about how to use please refer to each dependency

# Dependencies
 - <a href="https://github.com/blazerroadg/js-frontend-repository/edit/master/README.md" >  js-frontend-repository </a>
 - <a href="https://rnfirebase.io/" >  React Native Firebase </a>
 
# Install 
```bash
npm i react-native-firesotre-repository
```

## how to use 

```javascript
import { FirestoreRepository } from 'react-native-firesotre-repository/FirestoreRepository';
import { Todo } from '@/src/models/Todo';
import { FirestoreEntityMetaData } from 'react-native-firesotre-repository/FirestoreEntityMetaData';
import { FirestoreEntityMetaDataContext } from 'react-native-firesotre-repository/FirestoreEntityMetaDataContext';

export class TodoRepository extends FirestoreRepository<Todo> {
  constructor() {
    super(Todo, new FirestoreEntityMetaData(new FirestoreEntityMetaDataContext()));
  }
}


```
