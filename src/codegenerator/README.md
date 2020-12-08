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

Attempt | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 | #11
--- | --- | --- | --- |--- |--- |--- |--- |--- |--- |--- |---
Seconds | 301 | 283 | 290 | 286 | 289 | 285 | 287 | 287 | 272 | 276 | 269

## Step 3 - Absoult path
### Requirement

```javascript
// Meh
import config from '../../../../../../../config';

// Awesome!
import config from '@cuteapp/config';
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

