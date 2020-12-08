import { IEntityMetaData } from 'js-frontend-repository/models/interfaces/IEntityMetaData';
import { AzureCosmosEntityMetaDataContext } from './AzureCosmosEntityMetaDataContext';
import { AzureCosmosFetch } from './AzureCosmosFetch';

export class AzureFetchEntityMetaData implements IEntityMetaData<AzureCosmosFetch> {
    context: AzureCosmosEntityMetaDataContext;

    networking: AzureCosmosFetch = new AzureCosmosFetch();

    constructor(context: AzureCosmosEntityMetaDataContext) {
      this.context = context;
    }
}
