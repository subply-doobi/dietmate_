import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";

const BonusAlertContent = () => {
  return (
    <AlertContent>
      <Notice>
        {`내 코드를 등록한 친구가 30,000원 이상 주문시
5,000원 페이백 이벤트를 진행중입니다

이번 달 주문 횟수가 있다면
고객센터에서 보너스 신청문의를 해주세요`}
      </Notice>
    </AlertContent>
  );
};

export default BonusAlertContent;

const AlertContent = styled.View`
  width: 100%;
  padding: 40px 16px 40px 16px;
`;

const Notice = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
`;
