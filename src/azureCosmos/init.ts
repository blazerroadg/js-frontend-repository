import { AzureConfig, initAzureCosmos } from 'react-native-azure-cosmos';
import { GermlinConfig, initCosmosGermlin } from 'react-native-azure-cosmos-gremlin/germlin';

export const initGermlin = (config: GermlinConfig) : void => {
  initCosmosGermlin(config);
};

export const initCosmos = (config: AzureConfig) : void => {
  initAzureCosmos(config);
};
