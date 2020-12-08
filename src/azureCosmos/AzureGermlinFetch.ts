import { INetworking } from 'js-frontend-repository/interfaces/INetworking';
import { FetchParam, azuregermlinfetch } from 'react-native-azure-cosmos-gremlin/germlin';

export class AzureGermlinFetch implements INetworking {
  fetch(param: FetchParam): Promise<Response> {
    return azuregermlinfetch(param);
  }
}
