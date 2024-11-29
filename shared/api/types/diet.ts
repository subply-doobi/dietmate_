import {IProductData} from './product';

export interface IDietBaseData {
  companyCd: string;
  dietNo: string;
  dietSeq: string;
  statusCd: string;
  statusNm: string;
  userId: string;
}
export type IDietData = Array<IDietBaseData>;

export interface IDietDetailProductData extends IProductData {
  qty: string;
  dietNo: string;
  dietSeq: string;
  statusCd: string;
  statusNm: string;
}

export type IDietDetailData = Array<IDietDetailProductData>;
export type IDietDetailAllData = IDietDetailData;

export interface IDietDetailEmptyYnData {
  emptyYn: 'N' | 'Y';
}

export type IDietTotalData = Array<IDietDetailData>;
export type IDietTotalObjData = {
  [key: string]: {
    dietNo: string;
    dietSeq: string;
    dietDetail: IDietDetailData;
  };
};
