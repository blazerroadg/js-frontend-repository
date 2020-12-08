# rpcodegen
This package generates classes (Repository Interface, Repository Concert, Service, UnitOfWork.ts)  required in the 
<a href="https://github.com/blazerroadg/js-frontend-repository/edit/master/README.md">js-frontend-repository</a>
package.

For more information about js-frontend-repository please visit : <a href="https://github.com/blazerroadg/js-frontend-repository/edit/master/README.md">js-frontend-repository</a>

# Install
## Step 1 - Install package
```bash
npm i -g rpcodegen
```
## Step 2 - Adding Config file
Add repocgcnf.json file to root of your project :

```json
{
    "paths" : {
        "iRepositoryURI": "/src/repositories/interfaces/",  
        "repositoryURI": "/src/repositories/concretes/",
        "serviceURI": "/src/services/"
    },
    "modelPath": "@/src/models/",
    "baseSeviceType": "base",
    "baseRepositories": [
        {
            "alias": "firestore",
            "name": "FirestoreRepository",
            "path": "react-native-firesotre-repository/FirestoreRepository"
        },
        {
            "alias": "cosmos",
            "name": "AzureCosmosRepository",
            "path": "js-azurecosmos-client-repository/AzureCosmosRepository"
        },
        {
            "alias": "cosmosg",
            "name": "AzureGermlinRepository",
            "path": "js-azurecosmos-client-repository/AzureGermlinRepository"
        }
    ]
}


```
| Config  |  |
| :---:   | :-: |
| iRepositoryURI |  Path of Folder of Repository Interfaces  | 
| repositoryURI |  Path of Folder of Concerts Repositories  | 
| serviceURI |  Path of Folder of Services | 
| modelPath |  Path of Folder of Models | 
| baseSeviceType |  "base" :  Services  inherits from BaseService<TEntity, TRepository>  | 
|                |  "redux" : Services  inherits from BaseReduxService<TEntity, TRepository> | 
|baseRepositories|  "alias" : Alias will use on cli code generation | 
||  "name" : Name of Repository base class | 
||  "path" : path for import repository base class| 


## Step 3 - Absoult path
### Requirement

```javascript
// Meh
import config from '../../../../../../src/models/Todo';

// Awesome!
import config from '@/src/models/Todo';
```

### Add this babel plugin package

```bash
npm i --dev babel-plugin-module-resolver
```
### babel.config.js
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: ['.ts', '.tsx', '.js', '.ios.js', '.android.js'],
        alias: {
          '@cuteapp': './app'
        }
      }
    ],
    'jest-hoist'
  ]
};
```

### tsconfig.json

```javascrip
{
  "compilerOptions": {
   
   ...
   
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "./*"
      ],
    }
  }
}
```

### cli 
run this command on root of your project will generate the code 

``` bash
rpcodegen -m Todo -r firestore -s Todo
```
| options  |  |
| :---:   | :-: |
| -m |  Model Name  | 
| -r |  Base repository Alias  | 
| -s (optional) |  create file in sub folder  | 

