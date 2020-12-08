import { INetworking } from 'js-frontend-repository/interfaces/INetworking';
import { BaseFetchParam, azurefetch } from 'react-native-azure-cosmos/azurecosmos';

export class AzureCosmosFetch implements INetworking {
  fetch(param: BaseFetchParam): Promise<Response> {
    return azurefetch(param);
  }
}
