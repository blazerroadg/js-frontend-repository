# js-azurecosmos-client-repository
This package provides the base Repository class to fetch data from Azure cosmos and Azure cosmos Gremlin Database.

For more information about how to use please refer to each dependency


# Dependencies
 - <a href="https://github.com/blazerroadg/js-frontend-repository/edit/master/README.md" >  js-frontend-repository </a>
 - <a href="https://github.com/blazerroadg/react-native-azure-cosmos" >  react-native-azure-cosmos </a>
 - <a href="https://github.com/blazerroadg/react-native-azure-cosmos-gremlin" >  react-native-azure-cosmos-gremlin </a>
 - 
# Install 
```bash
npm i js-azurecosmos-client-repository
```

## how to use 

```javascript
import { AzureGermlinRepository } from "js-azurecosmos-client-repository/AzureGermlinRepository"
import { AzureGermlinEntityMetaData } from "js-azurecosmos-client-repository/AzureGermlinEntityMetaData";
import { AzureCosmosEntityMetaDataContext } from "js-azurecosmos-client-repository/AzureCosmosEntityMetaDataContext";
import { Todo } from '@/src/models/Todo';

export class TodoRepository extends AzureGermlinRepository<Todo> {
  constructor() {
    super(Todo, new AzureGermlinEntityMetaData(new AzureCosmosEntityMetaDataContext("<dbname>","<col>","Todo")));
  }
}

```
