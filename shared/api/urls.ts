// export const BASE_URL = 'http://subply.kr:8080';

// app-version-controller
export const GET_VERSION = `${process.env.EXPO_PUBLIC_BASE_URL}/api/every/app-version/get-app-version`;

// guest-controller
export const GET_GUEST_YN = `${process.env.EXPO_PUBLIC_BASE_URL}/api/every/guest/get-guest-yn`;

// user-token-contoller
export const GET_TOKEN = `${process.env.EXPO_PUBLIC_BASE_URL}/api/every/token/get-token`; //토큰 조회
export const GET_GUEST = `${process.env.EXPO_PUBLIC_BASE_URL}/api/every/token/get-token-guest`;
export const GET_AUTH = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/auth/get-auth`; //인증 여부 조회
export const RE_ISSUE_TOKEN = `${process.env.EXPO_PUBLIC_BASE_URL}/api/every/token/re-issue-token`;
export const GET_USER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/user/get-user`; //사용자 정보 조회
export const DELETE_USER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/user/delete-user`; //사용자 정보 삭제

// base-line-controller
export const CREATE_BASE_LINE = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/baseline/create-base-line`;
export const GET_BASE_LINE = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/baseline/get-base-line`;
export const UPDATE_BASE_LINE = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/baseline/update-base-line`;

// diet-controller
export const CREATE_DIET = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/create-diet`;
export const CREATE_DIET_CNT = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/create-diet-cnt`;
export const CREATE_DIET_DETAIL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/create-diet-detail`;
export const UPDATE_DIET_DETAIL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/update-diet-detail`;
export const UPDATE_DIET = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/update-diet`; //orderTable 생성
export const LIST_DIET = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/list-diet`;
export const LIST_DIET_DETAIL_ALL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/list-diet-detail-all`;
export const DELETE_DIET = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/delete-diet`;
export const DELETE_DIET_ALL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/delete-diet-all`;
export const DELETE_DIET_DETAIL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/delete-diet-detail`;
export const GET_DIET_DETAIL_EMPTY_YN = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/diet/get-diet-detail-empty-yn`;

// product-controller
export const GET_PRODUCT = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/get-product`;
export const LIST_PRODUCT = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/list-product`;
export const LIST_PRODUCT_DETAIL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/list-product-detail`;
export const CREATE_PRODUCT_AUTO = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/create-product-auto`;
export const CREATE_PRODUCT_MARK = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/create-product-mark`;
export const DELETE_PRODUCT_MARK = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/delete-product-mark`;
export const LIST_PRODUCT_MARK = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/list-product-mark`;
// export const FILTER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/product/get-product-filter-range`;

// code-controller
export const LIST_CODE = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/code/list-code`;

// category-controller
export const LIST_CATEGORY = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/category/list-category/CG`;
export const LIST_CATEGORY_PRODUCT_CNT = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/category/list-category-product-cnt/CG`;

// order-controller
export const CREATE_ORDER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/order/create-order`; //주문 정보 생성
export const UPDATE_ORDER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/order/update-order`; //주문 정보 수정
export const LIST_ORDER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/order/list-order`; //주문 정보 목록 조회
export const LIST_ORDER_DETAIL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/order/list-order-detail`; //주문 정보 목록 detail 조회
export const DELETE_ORDER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/order/delete-order`; //주문 정보 삭제

// address-controller
export const CREATE_ADDRESS = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/address/create-address`;
export const UPDATE_ADDRESS = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/address/update-address`;
export const LIST_ADDRESS = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/address/list-address`;
export const GET_ADDRESS = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/address/get-address`;
export const DELETE_ADDRESS = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/address/delete-address`;

// suggest-controller
export const GET_SUGGEST_USER_EXIST_YN = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/suggest/get-suggest-user-exist-yn`;
export const GET_SUGGEST_USER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/suggest/get-suggest-user-data`;
export const CREATE_SUGGEST_USER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/suggest/create-suggest-user`;
export const UPDATE_SUGGEST_USER = `${process.env.EXPO_PUBLIC_BASE_URL}/api/member/suggest/update-suggest-user`;
