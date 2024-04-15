
Map<String, String> customData = new HashMap<>();
        customData.put("CUSTOM_DATA_KEY", "{\"WIDGET_ID_KEY\":\"expectedWidgetId\"}");


import static org.mockito.Mockito.*;

ConsumerRecord<String, PushProcessorEvent> mockRecord = mock(new TypeToken<ConsumerRecord<String, PushProcessorEvent>>(){}.getRawType());

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import org.json.JSONObject;
import org.junit.Test;

public class MessageStoreUtilTest {

    @Test
    public void testShouldStoreMessage_WithMatchingAppKey_ReturnsTrue() {
        // Arrange
        String incomingAppKey = "appKey";
        PushProcessorEvent event = mock(PushProcessorEvent.class);
        when(event.getAppUID()).thenReturn(incomingAppKey);
        when(event.getData()).thenReturn(null);
        
        // Act
        boolean result = MessageStoreUtil.shouldStoreMessage(incomingAppKey, event);

        // Assert
        assertTrue(result);
    }

    @Test
    public void testShouldStoreMessage_WithCustomDataAndMatchingWidgetId_ReturnsTrue() {
        // Arrange
        JSONObject customData = new JSONObject();
        customData.put("WIDGET_ID_KEY", "expectedWidgetId");
        
        PushProcessorEvent event = mock(PushProcessorEvent.class);
        when(event.getData()).thenReturn(customData);
        when(event.getAppUID()).thenReturn("differentAppKey");
        
        // Act
        boolean result = MessageStoreUtil.shouldStoreMessage("appKey", event);

        // Assert
        assertTrue(result);
    }

    @Test
    public void testShouldStoreMessage_WithNonMatchingConditions_ReturnsFalse() {
        // Arrange
        PushProcessorEvent event = mock(PushProcessorEvent.class);
        when(event.getAppUID()).thenReturn("differentAppKey");
        when(event.getData()).thenReturn(null);
        
        // Act
        boolean result = MessageStoreUtil.shouldStoreMessage("appKey", event);

        // Assert
        assertFalse(result);
    }
    
    // Additional tests can be added to cover other branches and edge cases
}



# js-frontend-repository
  The Repository pattern is a well-documented way of working with a data source. In this library I used this pattern for manage API calls from javascript base frontend applications

# Benefits

- It centralizes API calls
- It gives a substitution point for the unit tests.
- Provides a flexible architecture
- It reduces redundancy of code
- It force programmer to work using the same pattern
- If you use this pattern then it is easy to maintain the centralized data access logic
- centralized API call 
- centralized error handeling
- Can use diffrents API Gatways in same project with no change in Service level
- Adding SOLID principals to your project


# Diagram
  <img width=800 title="repository diagram" src="https://github.com/blazerroadg/js-frontend-repository/blob/master/assests/repositoryarch.jpg">
  
# Install

```bash
npm i js-frontend-repository 
```
# How to use it
  <img width=800 title="repository diagram" src="https://github.com/blazerroadg/js-frontend-repository/blob/master/assests/repositoryworkfollow.jpg">
  
## Models
For each API call response you should add a model based on data you fetched from API for example if I want to fetch Todo list from API with properties of title and isDone you should add a model like this : 

```javascript
export class Todo {
    title? : string;

    isDone? : boolean;
}
```

## IRepository
For each model you should add one generic IRepository model of that entity, this Interface will be use on Service concretes of the entity and with help of this IRepository you can avoid changes in Service layer if you want to change Repository layer

```javascript
import { IRepository } from 'js-frontend-repository/interfaces/IRepository';
import { Todo } from '@/src/models/Todo';

export interface ITodoRepository extends IRepository<Todo> {
}

```

## Repository concrete

This file will contain all logic related to API calls for example if you are using GraphQL API, all queries should be developed in this class. Or if you are using Firestore API all related queries should be developed in this class. 

Usually instead of inherit from IRepository in this class it is better practice to inherit from one base repository.
current project have already three base repository developed, you can use this base repository in scenario you want to fetch data against Firestore , Azure Cosmos  or Azure Cosmos Graph Gremlin if you want to use another service or your own custom API call you should develop the base Repository related to that first 

For more information about implemented Repository base class please refer to each Repository base page : 

- <a href="https://github.com/blazerroadg/js-frontend-repository/tree/master/src/firestore"> Firestore Repository base </a>
- <a href="https://github.com/blazerroadg/js-frontend-repository/tree/master/src/azureCosmos"> Azure cosmos and Azure cosmos Gremlin Repository base </a>

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

you can find example project : <a href="https://github.com/blazerroadg/js-frontend-repository/tree/master/example/repository">Here</a>

## Service
For each entity you should add one service class too. Service class is responsible for logic across one entity, for example if you want to fetch Todo with Id = 2 and then change the isDone to true and update the result you should develop the logic of that in this class.
Service is for logic across one entity, and Repository class is for query of those logic.

```javascript
import { ITodoRepository } from '@/src/repositories/interfaces/ITodoRepository';
import { Todo } from '@/src/models/Todo';
import { BaseService } from 'js-frontend-repository/BaseSerivce';

export class TodoService extends BaseService<Todo, ITodoRepository> {
    async updateTodo(id: string) {
        const todo = await (await this.repository.getById(id)).entity;
        todo.isDone = true;
        await this.repository.update(todo)
    }
}

```
As you can see if you change the repository behind the Todo model this file will not change 

## UnitOfWork.ts
This singleton file holds all instances of services, and also in this file you can assign a concert repository for each service. With help of this file you can change the repository of services easily and this change will not need to change any logic on service and other layers of application.

```javascript
// new service import placeholder
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
```

# Code Generator
As you can see for adding new Entity in the repository pattern you have to add 3 files and modify one, to develop faster and avoid duplicate work you can use the “Repository Code Generator” package. 

## Install

```bash
npm i -g rpcodegen
```

For more information please see Repository Code Generator page  : 
<a href="https://github.com/blazerroadg/js-frontend-repository/tree/master/src/codegenerator" >Repository Code Generator</a>


# Redux
If you want to use Redux in your application and you want to manage the API call with repository pattern and automatically dispatch them on State and also if your looking for better solution to design your Actions and Routers in Redux you can use this package 

```bash
npm i react-redux-repository
```

For more information ablut Redux Repository please visit: 
<a href="https://github.com/blazerroadg/js-frontend-repository/tree/master/src/redux" >React Redux Repository</a>





