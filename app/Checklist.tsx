// RN
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { ShadowView } from "../shared/ui/styledComps";
import {
  Col,
  ScreenContainer,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "../shared/ui/styledComps";
import colors from "../shared/colors";
import { parseDate } from "../shared/utils/dateParsing";
import { IFlattedOrderedProduct } from "../shared/utils/screens/checklist/menuFlat";
import PieChart from "react-native-pie-chart";
import { useDispatch } from "react-redux";
import { openModal } from "../features/reduxSlices/modalSlice";
import MenuBox from "../components/screens/checklist/MenuBox";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import Icon from "@/shared/ui/Icon";

const Checklist = () => {
  // redux
  const dispatch = useDispatch();

  // navigation
  const router = useRouter();
  const { setOptions } = useNavigation();
  const { order: orderJString, checklist: initialChecklistJString } =
    useLocalSearchParams();
  const initialChecklist =
    initialChecklistJString && JSON.parse(initialChecklistJString as string);
  const order: IFlattedOrderedProduct[][] =
    orderJString && JSON.parse(orderJString as string);

  // useState
  // map 안에서 asyncStorage에 직접 접근할 수 없음. -> state와 동시에 관리해서
  // rendering할 때는 state 값으로.
  const [checklist, setChecklist] = useState<string[]>([]);

  // etc
  // fn
  const goToOrderHistoryDetail = () => {
    router.push({
      pathname: "/OrderHistoryDetail",
      params: {
        orderDetailData: orderJString,
        totalPrice: order[0][0].orderPrice,
      },
    });
  };

  // percentage
  const numerator = checklist.length || 0;
  const denominator = order.length === 0 ? 1 : order.length;
  const percentage = Math.round((numerator / denominator) * 100);

  // useEffect
  useEffect(() => {
    if (!order) return;
    setOptions({
      headerTitle: `${parseDate(order[0]?.[0]?.buyDate)} 주문`,
    });
  }, []);

  // asyncStorage checklist data
  useEffect(() => {
    initialChecklist && setChecklist(initialChecklist);
  }, [initialChecklistJString]);

  // 몸무게, 목표 변경 알럿
  useEffect(() => {
    if (percentage !== 100) return;
    percentage === 100 && dispatch(openModal({ name: "changeTargetAlert" }));
  }, [checklist]);

  // pieChart series
  const pieSeries = [
    { value: numerator, color: colors.main },
    { value: denominator - numerator, color: colors.backgroundLight2 },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: colors.backgroundLight2 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목, 파이그래프 */}
        <Card>
          <Row style={{ alignSelf: "center" }}>
            <CardTitle>
              근 ({numerator}/{denominator})
            </CardTitle>
            {percentage === 100 ? (
              <Icon
                name="checkCircle"
                color={colors.main}
                style={{ marginLeft: 8 }}
                boxSize={24}
                iconSize={20}
              />
            ) : (
              <Col
                style={{
                  width: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <PieChart
                  series={pieSeries}
                  widthAndHeight={16}
                  style={{ zIndex: 2 }}
                  cover={0.6}
                />
              </Col>
            )}
          </Row>
          <GoHistoryDetailBtn onPress={goToOrderHistoryDetail}>
            <TextGrey>주문전체정보</TextGrey>
            <Icon name="chevronRight" color={colors.textSub} iconSize={16} />
          </GoHistoryDetailBtn>
          <HorizontalSpace height={16} />

          {/* 끼니 체크리스트 */}
          <MenuBox
            order={order}
            checklist={checklist}
            setChecklist={setChecklist}
          />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default Checklist;

const Card = styled(ShadowView)`
  background-color: ${colors.white};
  border-radius: 10px;
  padding: 24px 16px 32px 16px;
  margin-top: 40px;
`;

const CardTitle = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
`;

const TextGrey = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;

const GoHistoryDetailBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: flex-end;
  margin-top: 24px;
`;
