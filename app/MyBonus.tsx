// 3rd
import styled from "styled-components/native";

// doobi
import { Container, Row, ShadowView, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import CtaButton from "@/shared/ui/CtaButton";
import { link } from "@/shared/utils/linking";
import { INQUIRY_URL } from "@/shared/constants";
import { useGetSuggestUser } from "@/shared/api/queries/suggest";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";

const MyBonus = () => {
  // redux
  const dispatch = useAppDispatch();

  // react-query
  const { data: suggestUserData } = useGetSuggestUser();

  const suggestUserCnt = suggestUserData?.suggestUserCnt
    ? parseInt(suggestUserData?.suggestUserCnt)
    : 0;
  const suggestPayCnt = suggestUserData?.suggestPayCnt
    ? parseInt(suggestUserData?.suggestPayCnt)
    : 0;

  return (
    <Container style={{ backgroundColor: colors.backgroundLight }}>
      <Card>
        <QuestionBtn
          onPress={() => dispatch(openModal({ name: "myBonusGuideAlert" }))}
        >
          <Icon name="questionCircle" color={colors.warning} />
        </QuestionBtn>
        <Row>
          <Icon name="creditCard" color={colors.black} />
          <Desc>총 {suggestUserCnt}명</Desc>
        </Row>
        <Row style={{ marginTop: 4 }}>
          <Icon name="userCircle" color={colors.black} iconSize={16} />
          <Desc>05월 30,000원 이상 주문 {suggestPayCnt}회</Desc>
        </Row>
        <CtaButton
          btnStyle={suggestPayCnt ? "active" : "inactive"}
          disabled={suggestPayCnt === 0}
          style={{ marginTop: 40 }}
          btnText="05월 보너스 신청하기"
          onPress={() => link(INQUIRY_URL)}
        />
      </Card>
    </Container>
  );
};

export default MyBonus;

const Card = styled(ShadowView)`
  width: 100%;
  height: 200px;
  border-radius: 10px;

  margin-top: 64px;
  padding: 24px 16px 32px 16px;
`;

const QuestionBtn = styled.TouchableOpacity`
  width: 24px;
  height: 24px;

  position: absolute;
  top: 16px;
  right: 16px;
  align-items: center;
  justify-content: center;
`;

const Desc = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  margin-left: 4px;
`;
