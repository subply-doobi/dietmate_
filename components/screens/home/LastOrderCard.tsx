// 3rd
import styled from "styled-components/native";
import { useNavigation } from "@react-navigation/native";

// doobi
import {
  Col,
  HorizontalSpace,
  Icon,
  Row,
  ShadowView,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { icons } from "@/shared/iconSource";
import { commaToNum } from "@/shared/utils/sumUp";
import LastOrderNutr from "./LastOrderNutr";
import { IFlattedOrderedProduct } from "@/shared/utils/screens/checklist/menuFlat";
import { useRouter } from "expo-router";
import { MENU_LABEL } from "@/shared/constants";

interface ILastOrderCard {
  isOrderEmpty: boolean;
  orderGroupedDataFlatten: IFlattedOrderedProduct[][][];
}
const LastOrderCard = ({
  isOrderEmpty,
  orderGroupedDataFlatten,
}: ILastOrderCard) => {
  // navigation
  const router = useRouter();

  return (
    !isOrderEmpty && (
      <ShadowView
        style={{
          marginHorizontal: 16,
          marginTop: 40,
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
          borderRadius: 10,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <Row>
            <Icon source={icons.checkRoundCheckedGreen_24} />
            <CardTitle>마지막 주문정보</CardTitle>
          </Row>
          <TargetChangeBtn
            onPress={() => router.push({ pathname: "/OrderHistory" })}
          >
            <SubText>주문전체정보</SubText>
            <Icon size={20} source={icons.arrowRight_20} />
          </TargetChangeBtn>
        </Row>
        <HorizontalSpace height={40} />
        <LastOrderNutr lastOrder={orderGroupedDataFlatten[0] || [[]]} />
        <Col style={{ marginTop: 24 }}>
          <Row>
            <Icon source={icons.calendar_24} />
            <CardDesc>{orderGroupedDataFlatten[0]?.[0]?.[0]?.buyDate}</CardDesc>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Icon source={icons.menu_24} />
            <CardDesc>
              "{MENU_LABEL[orderGroupedDataFlatten[0].length - 1]}" 공식
            </CardDesc>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Icon source={icons.card_24} />
            <CardDesc>
              {commaToNum(orderGroupedDataFlatten[0]?.[0]?.[0]?.orderPrice)} 원
            </CardDesc>
          </Row>
        </Col>
      </ShadowView>
    )
  );
};

export default LastOrderCard;

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
