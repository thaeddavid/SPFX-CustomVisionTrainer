import { ServiceScope, ServiceKey } from "@microsoft/sp-core-library";
import { SPHttpClient } from "@microsoft/sp-http";
import { IListData } from "../interfaces/index";

/**
 * The List service contract
 */
export interface IListService {
    getListData(lID, wUrl): Promise<IListData>;
}



export interface IListItem {
    Items: Promise<any>;
}

const SERVICE_KEY_TOKEN = "ListService";

export class ListService implements IListService {

    constructor(private serviceScope: ServiceScope) {}

    public getListData(lID, wUrl): Promise<IListData> {
        const apiUrl = `${wUrl}/_api/web/lists(guid'${lID}')?$select=Title,ItemCount`;
        const client = this.serviceScope.consume(SPHttpClient.serviceKey);
        return client.get(apiUrl, SPHttpClient.configurations.v1)
        .then(r => r.json())
        .then(r => ({
            Title: r.Title
        } as IListData));
    }
    public getListFolders(lID, wUrl): any {
        const apiUrl = `${wUrl}/_api/web/lists/GetById('${lID}')/rootFolder/Folders`;
        const client = this.serviceScope.consume(SPHttpClient.serviceKey);
        return client.get(apiUrl, SPHttpClient.configurations.v1)
        .then(l => l.json())
        .then(l => ({
            Items: l.value
        } as IListItem));
    }
    public getListItems(wUrl, wTitle, lTitle, Folder): any {
        const apiUrl = `${wUrl}/_api/web/getfolderbyserverrelativeurl('${wTitle + '/' + lTitle + '/' + Folder}')/Files`;
        //console.log('Url is ' + apiUrl);
        const client = this.serviceScope.consume(SPHttpClient.serviceKey);
        return client.get(apiUrl, SPHttpClient.configurations.v1)
        .then(l => l.json())
        .then(l => ({
            Items: l
        } as IListItem));
    }

    public static serviceKey: ServiceKey<IListService> = ServiceKey.create(SERVICE_KEY_TOKEN, ListService);
}