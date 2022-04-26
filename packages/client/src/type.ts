export interface ICodeCommentInfo {
  type: 'FC' | 'FF';
  title?: string;
  desc?: string;
}

export interface ICollectItem {
  imgPath?: string;
  codePath?: string;
  infos?: ICodeCommentInfo[];
}

export interface IData {
  ff: ICollectItem[];
  fc: ICollectItem[];
}
