import { IAddressData } from "@/shared/api/types/address";
import { IDietDetailAllData } from "@/shared/api/types/diet";
import { IUserData } from "@/shared/api/types/user";
import { channelKey, IPG } from "./payConsts";
import { ENV, MENU_NUM_LABEL } from "@/shared/constants";

type IPayMethod =
  | "CARD"
  | "VIRTUAL_ACCOUNT"
  | "TRANSFER"
  | "MOBILE"
  | "GIFT_CERTIFICATE"
  | "EASY_PAY";

interface IAddress {
  country?: string;
  addressLine1: string;
  addressLine2: string;
  city?: string;
  province?: string;
  zipcode?: string;
}

interface ICustomer {
  customerId: string;
  fullName: string;
  // firstName?: string; // fullName or first+lastName
  // lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: IAddress;
  gender?: "MALE" | "FEMALE" | "OTHER";
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
}

interface IWindowType {
  pc?: "IFRAME" | "REDIRECTION" | "POPUP";
  mobile?: "IFRAME" | "REDIRECTION" | "POPUP";
}

interface IProduct {
  id: string;
  name: string;
  code?: string;
  amount: number;
  quantity: number;
  tag?: string;
  isCulturalExpense?: boolean;
}
interface ICustomData {
  amount: string;
  buyerName: string;
  buyerTel: string;
  buyerAddr: string;
  buyerZipCode: string;
  entranceType: string;
  entranceNote: string;
  diet: {
    productNm: string;
    platform: string;
    price: string;
    qty: string;
    link: string;
  }[];
}
export interface IIamportPayParams {
  storeId: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  payMethod: IPayMethod;
  channelKey: string;
  // pgProvider?: string; // deprecated
  // isTestChannel?: boolean; // deprecated
  taxFreeAmount?: number; // 면세금액
  vatAmount?: number; // 부가세 미입력시 자동 1/11
  customer: ICustomer;
  windowType?: IWindowType;
  redirectUrl?: string;
  noticeUrls?: string[];
  confirmUrl?: string;
  appScheme?: string;
  isEscrow?: boolean; // 미입력시 기본값 false
  products: IProduct[];
  locale?: string;
  customData?: ICustomData;
  bypass?: object;
}

export interface IDoobiPayParams {
  // 두비서버 자체정보
  orderTypeCd: string;
  shippingPrice: string;
  orderPrice: string;

  // 아임포트 결제 정보 ,
  pg: string;
  escrow: string;
  payMethod: string;
  payName: string;
  payAmount: string;
  merchantUid: string;
  buyerName: string;
  buyerTel: string;
  buyerEmail: string;
  buyerAddr: string;
  buyerZipCode: string;
  appScheme: string;
  customerUid: string;
  customData: string;
}

// buyer_name, buyer_tel, buyer_email, buyer_addr, buyer_postcode
interface ISetCustomData {
  priceTotal: number;
  shippingPrice: number;
  buyerName: string;
  buyerTel: string;
  listAddressData: IAddressData[] | undefined;
  selectedAddrIdx: number;
  entranceType: string;
  entranceNote: string;
  dietDetailAllData: IDietDetailAllData;
}
export const setCustomData = ({
  priceTotal,
  shippingPrice,
  buyerName,
  buyerTel,
  listAddressData,
  selectedAddrIdx,
  entranceType,
  entranceNote,
  dietDetailAllData,
}: ISetCustomData): ICustomData => {
  return {
    amount: String(priceTotal + shippingPrice),
    buyerName: buyerName,
    buyerTel: buyerTel,
    buyerAddr: listAddressData
      ? listAddressData[selectedAddrIdx]?.addr1 +
        " | " +
        listAddressData[selectedAddrIdx]?.addr2
      : "",
    buyerZipCode: listAddressData
      ? listAddressData[selectedAddrIdx]?.zipCode
      : "",
    entranceType: entranceType,
    entranceNote: entranceNote,
    diet: dietDetailAllData?.map((food, idx) => {
      return {
        productNm: food.productNm,
        platform: food.platformNm,
        price: food.price,
        qty: food.qty,
        link: food.link2,
      };
    }),
  };
};

interface ISetPayParams {
  userData: IUserData;
  paymentMethod: IPayMethod;
  pg: IPG;
  menuNum: number;
  productNum: number;
  priceTotal: number;
  shippingPrice: number;
  buyerName: string;
  buyerTel: string;
  listAddressData: IAddressData[] | undefined;
  selectedAddrIdx: number;
  customData: ICustomData;
}
export const setPayParams = ({
  userData,
  paymentMethod,
  pg,
  menuNum,
  productNum,
  priceTotal,
  shippingPrice,
  buyerName,
  buyerTel,
  listAddressData,
  selectedAddrIdx,
  customData,
}: ISetPayParams): {
  payParams_iamport: IIamportPayParams;
  payParams_doobi: IDoobiPayParams;
} => {
  const payParams_iamport: IIamportPayParams = {
    storeId: ENV.STORE_ID_IAMPORT as string,
    paymentId: `paymentU${userData.userId}D${Date.now()}`,
    orderName: `${MENU_NUM_LABEL[menuNum - 1]} 공식 (식품 ${productNum}개)`,
    totalAmount: priceTotal + shippingPrice,
    currency: "CURRENCY_KRW",
    payMethod: paymentMethod,
    channelKey: channelKey[pg],
    // taxFreeAmount : '',
    // vatAmount : '',
    customer: {
      customerId: userData.userId,
      fullName: buyerName,
      phoneNumber: buyerTel,
      email: userData.email || undefined,
      address: {
        addressLine1: listAddressData?.[selectedAddrIdx]?.addr1 || "",
        addressLine2: listAddressData?.[selectedAddrIdx]?.addr2 || "",
        city: "",
        province: "",
        zipcode: listAddressData?.[selectedAddrIdx]?.zipCode,
      },
    },
    // windowType: {
    //   pc: "REDIRECTION",
    //   mobile: "REDIRECTION",
    // },
    // redirectUrl: process.env.EXPO_PUBLIC_REDIRECT_URL_IAMPORT as string,
    // noticeUrls : '',
    // confirmUrl : '',
    // appScheme: process.env.EXPO_PUBLIC_APP_SCHEME_IAMPORT as string,
    // isEscrow: undefined,
    products: [
      {
        id: `productU${userData.userId}D${Date.now()}`,
        name: `${MENU_NUM_LABEL[menuNum - 1]} 공식 (식품 ${productNum}개)`,
        amount: priceTotal + shippingPrice,
        quantity: 1,
      },
    ],
    // locale : undefined,
    // bypass : undefined,
    customData,
  };

  // doobi
  const payParams_doobi: IDoobiPayParams = {
    // 두비서버 자체정보
    orderTypeCd: "SP011002",
    shippingPrice: String(shippingPrice),
    orderPrice: String(payParams_iamport.totalAmount),
    // 아임포트 결제 정보 ,
    pg,
    escrow: String(false),
    payMethod: payParams_iamport.payMethod,
    payName: payParams_iamport.orderName,
    payAmount: String(payParams_iamport.totalAmount),
    merchantUid: payParams_iamport.paymentId,
    buyerName,
    buyerTel,
    buyerEmail: payParams_iamport.customer.email || "",
    buyerAddr:
      (listAddressData?.[selectedAddrIdx]?.addr1 || "") +
        " | " +
        listAddressData?.[selectedAddrIdx]?.addr2 || "",
    buyerZipCode: listAddressData?.[selectedAddrIdx]?.zipCode || "",
    appScheme: ENV.APP_SCHEME_IAMPORT as string,
    customerUid: "customer_" + Date.now(),
    customData: `${customData.entranceType} | ${customData.entranceNote} | ${shippingPrice}`,
  };

  return {
    payParams_iamport,
    payParams_doobi,
  };
};
