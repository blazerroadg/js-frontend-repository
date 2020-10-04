# react-native-azure-cosmos
This package provide query and insert against azure cosmos db 

# Install
```
npm i react-native-azure-cosmos --save
```


## Usage

Import library

```javascript
import { azurefetch, initAzureCosmos } from 'react-native-azure-cosmos/azurecosmos'
```

Init cosmos auth 


```javascript
class App extends React.Component {
  constructor(props) {
    super(props);
    initAzureCosmos(
    {
      masterKey:${YOUR COSMOS DB MASTER KEY},
      version: "2017-02-22",
      dbUri: ${YOUR COSMOS DB URL},
      dbname: ${YOUR COSMOS DB NAME},

    }
    ...
  }
```


Run a query 

```javascript
azure = async () => {
   const response = await azurefetch({
            dbname : "", //optional parameter if you want to quiry agiants another DB
            col: ${COL NAME},
            body: {
                "query": "SELECT c.id FROM ${COL NAME} c WHERE c.uid = @email",
                "parameters": [
                    { "name": "@email", "value": email }
                ]
            },
            type: 'Query',
            partitionKey: ${PARTITION VALUE}
        });

  }
```



INSERT new Docs

```javascript

azure = async () => {
    const response = await azurefetch({
              col: ${COL NAME},
              body: {
                  "id": username,
                  "code": code,
                  "name": name,
                  "photoUri": photoURL,
              },
              type: 'Insert',
              partitionKey:  ${PARTITION VALUE}
          });
```




Exec SP

```javascript

azure = async () => {
   const response = await azurefetch({
        spname: ${SP NAME},
        col: ${COL NAME},
        body: [id, { "photoUri": photoURL }],
        type: 'Sp',
        partitionKey: code
    });
```
