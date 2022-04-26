export interface ICodeCommentInfo {
  type: 'FC' | 'FF';
  title?: string;
  desc?: string;
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
