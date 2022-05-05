export enum ResourceType {
  FF = 'FF',
  FC = 'FC'
}

export interface IParams {
  name?: string;
  type?: string;
  description?: string;
}

export interface ICodeCommentInfo {
  type: ResourceType;
  title?: string;
  desc?: string;
  startLine?: number;
  params?: IParams[];
}

export interface ICollectItem {
  imgPath?: string;
  codePath?: string;
  infos?: ICodeCommentInfo[];
}

export interface ICollectItemRes {
  imgPaths?: string[];
  codePath?: string;
  info?: ICodeCommentInfo;
}

export interface IData {
  [ResourceType.FC]: ICollectItemRes[];
  [ResourceType.FF]: ICollectItemRes[];
  title?: string;
  wsPort?: number;
}

export interface IConfig {
  paths?: string[];
  suffix?: string[];
  port?: number;
  title?: string;
}
