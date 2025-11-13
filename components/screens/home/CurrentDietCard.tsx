// RN, expo
import { ActivityIndicator } from "react-native";
import { forwardRef } from "react";

// 3rd
import { useRouter } from "expo-router";
import styled from "styled-components/native";

// doobi
import {
  Col,
  Row,
  ShadowView,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import CtaButton from "@/shared/ui/CtaButton";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { commaToNum } from "@/shared/utils/sumUp";
import { MENU_NUM_LABEL } from "@/shared/constants";
import Icon from "@/shared/ui/Icon";

interface ICurrentDietCard {
  formulaStatus: string;
  ctaBtnText: string;
  menuNum: number;
  priceTotal: number;
  totalShippingPrice: number;
}
const CurrentDietCard = forwardRef((p: ICurrentDietCard, ctaBtnRef) => {
  const { formulaStatus, ctaBtnText, menuNum, priceTotal, totalShippingPrice } =
    p;

  // navigation
  const router = useRouter();

  // react-query
  const { data: dTOData, isLoading: isDTObjLoading } = useListDietTotalObj();

  // fn
  const onCtaPressed = () => {
    if (formulaStatus === "empty") {
      router.push({ pathname: "/(tabs)/Formula" });
      return;
    }
    if (formulaStatus === "inProgress") {
      router.push({ pathname: "/(tabs)/Formula" });
      return;
    }

    if (!dTOData) return;
    router.push({ pathname: "/Order" });
  };

  // useEffect
  //

  const menuCardTitle =
    formulaStatus === "empty"
      ? "새로운 공식을 기다리고 있어요!"
      : formulaStatus === "inProgress"
      ? "만들던 공식이 있어요"
      : "계산할 공식이 있어요";
  return (
    <ShadowView
      style={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
        marginHorizontal: 16,
        borderRadius: 10,
      }}
    >
      {isDTObjLoading ? (
        <ActivityIndicator size="small" color={colors.main} />
      ) : (
        <Col>
          <Row style={{ justifyContent: "space-between" }}>
            <Row>
              <Icon name="warningCircle" iconSize={16} color={colors.warning} />
              <CardTitle>{menuCardTitle}</CardTitle>
            </Row>
          </Row>
          {formulaStatus !== "empty" && (
            <Col style={{ marginTop: 24 }}>
              <Row>
                <Icon name="food" color={colors.black} />
                <CardDesc>"{MENU_NUM_LABEL[menuNum - 1]}" 공식</CardDesc>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Icon name="creditCard" color={colors.black} />
                <CardDesc>{commaToNum(priceTotal)} 원</CardDesc>
              </Row>
            </Col>
          )}
          <CtaButton
            ref={ctaBtnRef}
            onPress={onCtaPressed}
            btnStyle="activeDark"
            btnText={ctaBtnText}
            style={{ marginTop: 40 }}
          />
        </Col>
      )}
    </ShadowView>
  );
});

export default CurrentDietCard;

const MainText = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
`;

const SubText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const TargetChangeBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const CardTitle = styled(MainText)`
  font-weight: bold;
  margin-left: 4px;
`;

const CardDesc = styled(MainText)`
  margin-left: 4px;
`;
