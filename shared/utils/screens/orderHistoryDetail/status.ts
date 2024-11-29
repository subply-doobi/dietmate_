import colors from "@/shared/colors";

export const getStatusContent = (resultStatusCd: string) => {
  let statusColor = "";
  let statusText = "";
  let statusSubTitle = "";

  if (resultStatusCd === "SP013001") {
    statusColor = colors.orange;
    statusText = "주문 확인 중입니다";
    statusSubTitle = "근의공식에서 주문을 확인하고 있어요";
  } else if (resultStatusCd === "SP013002") {
    statusColor = colors.dark;
    statusText = "재고가 없는 상품이 있어요";
    statusSubTitle = "혹시 연락을 못 받으셨다면 꼭 문의해주세요!";
  } else if (resultStatusCd === "SP013003") {
    statusColor = colors.dark;
    statusText = "환불 처리된 주문입니다";
    statusSubTitle = "정상적으로 환불처리되었어요";
  } else if (resultStatusCd === "SP013004") {
    statusColor = colors.dark;
    statusText = "주문이 정상적으로 접수되었어요";
    statusSubTitle = "해당 식품사에서 1~2일 내 배송될 예정입니다";
  }

  return {
    statusColor,
    statusText,
    statusSubTitle,
  };
};
