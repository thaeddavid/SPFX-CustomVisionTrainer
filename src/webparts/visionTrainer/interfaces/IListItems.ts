export interface IListItem {
    Title?: string;
    ImageUrl?: string;
    ListSelected: boolean;
    AllSelected: boolean;
    AllImages: Array<any>;
    ReadyToTrain: boolean;
    TrainingText: string;
}

export interface IListData {
  Title: string;
  Folder: number;
  lID: string;
  wUrl: string;
  wTitle: string;
  ListSelected: boolean;
  AllSelected: boolean;
  AllImages: Array<any>;
  ReadyToTrain: boolean;
  TrainingText: string;
}

export interface IAllLItems {
    Items?: Array<IListItem>;
}

export interface IFolderItem {
  Name?: string;
  value: Array<any>;
}
export interface IAllFolders {
  Items?: Object;
  value: Array<any>;
}