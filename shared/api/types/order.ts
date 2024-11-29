export interface IOrderedProduct {
  tags: string;
  price: string;
  categoryCd: string;
  subCategoryCd: string;
  productNo: string;
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
  companyCd: string;
  userId: string;
  dietNo: string;
  statusCd: string;
  orderNo: string;
  qty: string;
  productNm: string;
  minQty: string;
  shippingPrice: string;
  freeShippingPrice: string;
  freeShippingYn: string;
  servingSize: string;
  sodium: string;
  sugar: string;
  fiber: string;
  cholesterol: string;
  transFat: string;
  saturatedFat: string;
  manufacturerNm: string;
  manufacturerBizNo: string;
  distributerNm: string;
  distributerBizNo: string;
  platformNm: string;
  itemReportNo: string;
  mainAttId: string;
  subAttId: string;
  link1: string;
  link2: string;
  categoryNm: string;
  subCategoryNm: string;
  mainAttUrl: string;
  subAttUrl: string;
  pg: string;
  payMethod: string;
  payName: string;
  payAmount: string;
  buyerName: string;
  buyerTel: string;
  buyerEmail: string;
  buyerAddr: string;
  buyerZipCode: string;
  merchantUid: string;
  customData: string;
  appScheme: string;
  escrow: string;
  customerUid: string;
  orderPrice: string;
  buyDate: string;
  productShippingPrice: string;
  statusNm: string;

  // 스스로구매 | 두비가도와줘
  orderTypeCd: string;
  orderTypeNm: string;
}

export type IOrderData = IOrderedProduct[];
export type IOrderDetailData = IOrderedProduct[];

export interface IOrderCreate {
  // 두비서버 자체 정보
  orderTypeCd: string;
  shippingPrice: string;
  orderPrice: string;

  // 아임포트 결제 정보 복사
  pg: string;
  escrow: string;
  payMethod: string;
  payName: string;
  payAmount: string;
  customData?: string;
  merchantUid: string;
  buyerName: string;
  buyerTel: string;
  buyerEmail: string;
  buyerAddr: string;
  buyerZipCode: string;
  appScheme: string;
  customerUid: string;

  // 서버 자동생성
  // companyCd?: string;
  // userId?: string;
}
