import { ActivityIndicator } from "react-native";
import {
  Col,
  Icon,
  Row,
  ShadowView,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import CtaButton from "@/shared/ui/CtaButton";
import { forwardRef } from "react";
import styled from "styled-components/native";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import {
  setFoodToOrder,
  setShippingPrice,
} from "@/features/reduxSlices/orderSlice";
import { commaToNum } from "@/shared/utils/sumUp";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";

interface ICurrentDietCard {
  isDietEmpty: boolean;
  ctaBtnText: string;
  menuNum: number;
  priceTotal: number;
  totalShippingPrice: number;
}
const CurrentDietCard = forwardRef((p: ICurrentDietCard, ctaBtnRef) => {
  const { isDietEmpty, ctaBtnText, menuNum, priceTotal, totalShippingPrice } =
    p;

  // redux
  const dispatch = useAppDispatch();

  // navigation
  const router = useRouter();

  // react-query
  const { data: dTOData, isLoading: isDTObjLoading } = useListDietTotalObj();

  // fn
  const onCtaPressed = () => {
    if (isDietEmpty) {
      router.push({ pathname: "/(tabs)/Formula" });
      return;
    }
    if (!dTOData) return;
    dispatch(setFoodToOrder(dTOData));
    dispatch(setShippingPrice(totalShippingPrice));
    router.push({ pathname: "/Order" });
  };

  // useEffect
  //

  const menuCardTitle = isDietEmpty
    ? "새로운 식단 구성을 기다리고 있어요"
    : "구매 대기 중인 끼니가 있어요";
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
              <Icon source={icons.warning_24} />
              <CardTitle>{menuCardTitle}</CardTitle>
            </Row>

            {!isDietEmpty && (
              <TargetChangeBtn
                onPress={() => router.push({ pathname: "/(tabs)/Diet" })}
              >
                <SubText>끼니상세</SubText>
                <Icon size={20} source={icons.arrowRight_20} />
              </TargetChangeBtn>
            )}
          </Row>
          {!isDietEmpty && (
            <Col style={{ marginTop: 24 }}>
              <Row>
                <Icon source={icons.menu_24} />
                <CardDesc>{menuNum}개 끼니</CardDesc>
              </Row>
              <Row style={{ marginTop: 8 }}>
                <Icon source={icons.card_24} />
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
