import { INetworking } from "../../interfaces/INetworking";

export interface IEntityMetaData<TTNetworking extends INetworking> {
    context: any;
    networking: TTNetworking;
}