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
  imgPath?: string;
  codePath?: string;
  info?: ICodeCommentInfo;
}

export interface IData {
  [ResourceType.FC]: ICollectItemRes[];
  [ResourceType.FF]: ICollectItemRes[];
}

export interface IConfig {
  paths?: string[];
  suffix?: string[];
  port?: number;
}
