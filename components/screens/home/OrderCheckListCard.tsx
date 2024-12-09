// RN
import { useEffect, useState } from "react";

// 3rd
import PieChart from "react-native-pie-chart";
import styled from "styled-components/native";
import { useIsFocused, useNavigation } from "@react-navigation/native";

// doobi
import {
  Col,
  HorizontalSpace,
  Icon,
  Row,
  ShadowView,
  TextMain,
} from "../../../shared/ui/styledComps";
import colors from "../../../shared/colors";
import { icons } from "../../../shared/iconSource";
import { parseDate } from "../../../shared/utils/dateParsing";
import { IFlattedOrderedProduct } from "../../../shared/utils/screens/checklist/menuFlat";
import { getTotalChecklist } from "../../../shared/utils/asyncStorage";
import { useRouter } from "expo-router";

interface IOrderChecklistCard {
  isOrderEmpty: boolean;
  orderGroupedDataFlatten: IFlattedOrderedProduct[][][];
}
const OrderChecklistCard = ({
  isOrderEmpty,
  orderGroupedDataFlatten,
}: IOrderChecklistCard) => {
  // navigation
  const router = useRouter();
  const isFocused = useIsFocused();

  // useState
  const [showEveryList, setShowEveryList] = useState(false);
  const [totalChecklist, setTotalChecklist] = useState<{
    [key: string]: string[];
  }>({}); // asyncStorage checklist 전체 데이터

  // useEffect
  // asyncStorage 체크리스트 데이터 가져오기
  useEffect(() => {
    if (!isFocused) return;
    const loadCheckList = async () => {
      const list = await getTotalChecklist();
      setTotalChecklist(list);
    };
    loadCheckList();
  }, [isFocused]);

  // etc
  const flattenOrderData = showEveryList
    ? orderGroupedDataFlatten
    : orderGroupedDataFlatten.slice(0, 4);

  // 현재 식단 상태, 주문 상태에 따른 카드 제목 및 버튼 텍스트

  const checklistCardTitle = isOrderEmpty
    ? "아직 주문한 끼니가 없어요"
    : "식사하실 때 체크해보세요";

  return (
    <ShadowView
      style={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
        marginHorizontal: 16,
        borderRadius: 10,
        marginTop: 40,
      }}
    >
      <Row>
        {isOrderEmpty && <Icon source={icons.warning_24} />}
        <CardTitle>{checklistCardTitle}</CardTitle>
      </Row>

      {!isOrderEmpty && <HorizontalSpace height={40} />}
      <ChecklistBox>
        {!isOrderEmpty &&
          flattenOrderData.map((order, idx) => {
            const numerator =
              (Object.keys(totalChecklist).length !== 0 &&
                totalChecklist[order[0]?.[0]?.orderNo]?.length) ||
              0;
            const denominator = order.length === 0 ? 1 : order.length;
            const percentage = Math.round((numerator / denominator) * 100);
            return (
              <ShadowView
                key={idx}
                style={{ borderRadius: 5, width: "100%", height: 72 }}
              >
                <ChecklistBtn
                  onPress={() =>
                    router.push({
                      pathname: "/Checklist",
                      params: {
                        order: JSON.stringify(order),
                        checklist: JSON.stringify(
                          totalChecklist[order[0]?.[0]?.orderNo] || []
                        ),
                      },
                    })
                  }
                >
                  <LeftBar />
                  <CheckListTitle>
                    {parseDate(order[0]?.[0]?.buyDate)} 주문
                  </CheckListTitle>
                  <Row>
                    <CheckListSubTitle>{percentage}% 완료</CheckListSubTitle>

                    {percentage === 100 ? (
                      <Icon
                        style={{ marginLeft: 8, zIndex: 2 }}
                        source={icons.checkRoundCheckedMain_24}
                      />
                    ) : (
                      <Col
                        style={{
                          width: 24,
                          height: 24,
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: 8,
                        }}
                      >
                        <PieChart
                          series={[numerator, denominator - numerator]}
                          widthAndHeight={20}
                          style={{ zIndex: 2 }}
                          sliceColor={[colors.main, colors.white]}
                          coverRadius={0.6}
                        />
                      </Col>
                    )}
                  </Row>
                  {percentage === 100 && <OpacityView />}
                </ChecklistBtn>
              </ShadowView>
            );
          })}
      </ChecklistBox>
      {orderGroupedDataFlatten.length > 4 && (
        <LoadMoreBtn onPress={() => setShowEveryList((v) => !v)}>
          <Icon
            source={showEveryList ? icons.arrowUp_20 : icons.arrowDown_20}
          />
        </LoadMoreBtn>
      )}
    </ShadowView>
  );
};

export default OrderChecklistCard;

const MainText = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
`;

const CardTitle = styled(MainText)`
  font-weight: bold;
  margin-left: 4px;
`;

const ChecklistBox = styled.View`
  row-gap: 24px;
`;

const ChecklistBtn = styled.TouchableOpacity`
  width: 100%;
  height: 72px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  border-width: 0.3px;
  border-color: ${colors.lineLight};
  padding: 0px 16px;
`;

const LeftBar = styled.View<{ screen?: "Home" | "Diet" | string }>`
  position: absolute;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: ${colors.inactive};
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const CheckListTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
`;

const CheckListSubTitle = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
`;

const OpacityView = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${colors.whiteOpacity70};
  z-index: 1;
`;

const LoadMoreBtn = styled.TouchableOpacity`
  width: 48px;
  height: 24px;
  align-self: center;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
`;
