# react-native-repository
if you are searching for way to write cleaner code, prevent using fetch all over your ACTIONS and you are not happy with very big long REDUCER switch this is solution for you 
for example app visit : https://github.com/blazerroad/workwolf/

# Diagram

  <img width=800 title="repository diagram" src="https://github.com/blazerroad/workwolf/blob/master/public/repository.png">

# Why
This example show you how you can manage your code better with redux pattern if you are involved in mid-size or bigger application, with help of Repository pattern you can achieve SOLID principal and make cleaner, extendable,  easy to change 

# How

## Step 1
### Install
```bash
npm i react-native-repository --save
```

## Step 2
For actions you should add two folders :
```bash
-respositories
-services
```
repository pattern is base on type of entity, for each entity you should add : 
  - model 
  - respository
  - service 
  
  #### Model 
each model should be extends IEntity, DefaultEntity is default calss implemented IEntity you can use DefaultEntity or implement your own
```javascript
import {DefaultEntity } from 'react-native-repository/repository'

export class TopHashtag extends DefaultEntity {

    id : string;
    title : string;

    constructor(id? : string, title? : string) {
        super();
        this.id = id;
        this.title = title;
    }
}
```

#### Repository
each repository should extends IRepository at react-native-repository I developed two repository for "Azure cosmos" and "azure germlin cosmos" for react-redux-libarary you should implement your own base repository base the backend service which your are using.

```javascript
import { AzureCosmosRepository,AzureFetchEntityMetaData } from "react-native-repository/repository"
import { TopHashtag } from '../../models/TopHashtag'

export class TopHashtagRepository extends AzureCosmosRepository<TopHashtag>
{
    constructor()
    {
        const metaData = new AzureFetchEntityMetaData("TopHashtag","Hashtag","Chiko");
        super(metaData);
    }
    async map(response: Response): Promise<Array<TopHashtag>> {
       const mapping = this.innerMap(response, new TopHashtag(), new Array<TopHashtag>());
       return mapping;
    }
}
```

#### service
each service should extends IService for REDUX I implemented BaseReduxService but you can impliment any Base service.

```javascript
import { BaseReduxService } from "react-native-repository/repository"
import { TopHashtag } from '../../models/TopHashtag'
import {TopHashtagRepository} from '../repositories/TopHastagsRepository'

export class TopHashtagsService extends BaseReduxService<TopHashtag,TopHashtagRepository>
{
    constructor(dispatch: any)
    {
        const repository = new  TopHashtagRepository();
        super(dispatch,repository);
    }

}
```

#### service FACAD
this class is contains instance of all services which created.
```javascript

import { TopHashtagsService } from "./TopHashtagsService";
import { UploadImage } from "./UploadImage";
import { initAzureCosmos } from 'react-native-azure-cosmos/azurecosmos'

export class Services {
    public static instance: Services;

    public static init(dispatch: any) {
        Services.instance = new Services(dispatch);
    }

    public topHashtage: TopHashtagsService
    public uploadImage: UploadImage

    private constructor(dispatch: any) {
        this.topHashtage = new TopHashtagsService(dispatch);
        this.uploadImage = new UploadImage();
       
    }
}
```
#### add service FACAD to REDUX

after creating your store call Services.init(store.dispatch)
```javascript
import { Services } from './store/actions/services/services'

const store = createStore(rootReducer, applyMiddleware(crashReporter, thunk, vanillaPromise, readyStatePromise));
Services.init(store.dispatch);
```

