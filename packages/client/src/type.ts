export interface ICodeCommentInfo {
  type: 'FC' | 'FF';
  title?: string;
  desc?: string;
  startLine?: number;
}

export interface ICollectItemRes {
  imgPath?: string;
  codePath?: string;
  info?: ICodeCommentInfo;
}

export interface IData {
  ff: ICollectItemRes[];
  fc: ICollectItemRes[];
}
