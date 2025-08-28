export const parseUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const queryString = url.split("?")[1];
  if (queryString) {
    const pairs = queryString.split("&");
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  }
  return params;
};

export const getPaymentResult = (url: string) => {
  const params = parseUrlParams(url);
  return {
    // iamport 자체 response params
    code: params.code,
    message: params.message,
    paymentId: params.paymentId,
    pgCode: params.pgCode,
    pgMessage: params.pgMessage,
    transactionType: params.transactionType,
    txId: params.txId,
    status: params.status,
    storeId: params.storeId,

    // 간혹 웹뷰 중간에서 우리 앱으로 돌아올 때 위 params말고 complete type이 있기도 함 (실패)
    completeType: params.completeType,
  };
};
