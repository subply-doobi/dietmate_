import styled from "styled-components/native";

import {
  BtnCTA,
  Col,
  Container,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { useRouter } from "expo-router";

// 결제 완료, 구매완료 페이지
const OrderComplete = () => {
  const router = useRouter();

  const goToOrderHistory = () => {
    router.canDismiss() && router.dismissAll();
    router.replace({ pathname: "/OrderHistory" });
  };
  const goToHome = () => {
    router.canDismiss() && router.dismissAll();
    router.replace({ pathname: "/(tabs)" });
  };
  return (
    <Container>
      <CompleteText>구매 완료!</CompleteText>
      <Desc style={{ marginTop: 80 }}>
        [근의공식]{"\n"}
        1차 테스트에 참여해주셔서 감사합니다
      </Desc>
      <Desc>
        <Desc>구매한 상품들은{"\n"}</Desc>
        <Desc style={{ fontWeight: "bold", color: colors.textMain }}>
          각 식품사에서 직접 배송
        </Desc>
        이 진행됩니다
      </Desc>

      <Desc>
        배송 문의는{" "}
        <Desc style={{ fontWeight: "bold", color: colors.textMain }}>
          카톡 1:1 채팅
        </Desc>
        을 이용해주세요{"\n"}
        [마이페이지] {">"} [문의하기]
      </Desc>

      <Desc>
        초기 서비스라 불편한 점이 많지만{"\n"}
        빠른 시일 내에 서비스를 개선할게요
      </Desc>

      <BtnBox>
        <BtnCTA btnStyle="border" onPress={goToOrderHistory}>
          <BtnText style={{ color: colors.textSub }}>주문내역 바로가기</BtnText>
        </BtnCTA>
        <BtnCTA
          btnStyle="activated"
          style={{ marginTop: 16 }}
          onPress={goToHome}
        >
          <BtnText>두비랑 식단구성 더 해보기</BtnText>
        </BtnCTA>
      </BtnBox>
    </Container>
  );
};

export default OrderComplete;

const CompleteText = styled(TextMain)`
  font-size: 36px;
  font-weight: 900;

  margin-top: 48px;
`;

const Desc = styled(TextSub)`
  font-size: 16px;
  font-weight: normal;

  margin-top: 24px;
`;

const BtnBox = styled.View`
  position: absolute;
  bottom: 8px;
  width: 100%;
  align-self: center;
`;

const BtnText = styled(TextMain)`
  font-size: 16px;
  color: ${colors.white};
`;
