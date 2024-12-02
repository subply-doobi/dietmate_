// RN
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { ShadowView } from "../shared/ui/styledComps";
import {
  Col,
  Container,
  HorizontalSpace,
  Icon,
  Row,
  TextMain,
  TextSub,
} from "../shared/ui/styledComps";
import colors from "../shared/colors";
import { icons } from "../shared/iconSource";
import { parseDate } from "../shared/utils/dateParsing";
import { IFlattedOrderedProduct } from "../shared/utils/screens/checklist/menuFlat";
import PieChart from "react-native-pie-chart";
import DAlert from "../shared/ui/DAlert";
import CommonAlertContent from "../components/common/alert/CommonAlertContent";
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "../features/reduxSlices/modalSlice";
import MenuBox from "../components/screens/checklist/MenuBox";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

const Checklist = () => {
  // redux
  const dispatch = useDispatch();
  const changeTargetAlert = useAppSelector(
    (state) => state.modal.modal.changeTargetAlert
  );

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
  const denominator = order.length;
  const percentage = Math.round((numerator / denominator) * 100);

  // useEffect
  useEffect(() => {
    if (!order) return;
    setOptions({
      headerTitle: `${parseDate(order[0][0].buyDate)} 주문`,
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
  return (
    <Container style={{ backgroundColor: colors.backgroundLight2 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목, 파이그래프 */}
        <Card>
          <Row style={{ alignSelf: "center" }}>
            <CardTitle>
              끼니 ({numerator}/{denominator})
            </CardTitle>
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
          <GoHistoryDetailBtn onPress={goToOrderHistoryDetail}>
            <TextGrey>주문전체정보</TextGrey>
            <Icon size={20} source={icons.arrowRight_20} />
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

      {/* 목표변경 알럿 */}
      <DAlert
        alertShow={changeTargetAlert.isOpen}
        confirmLabel="목표변경"
        renderContent={() => (
          <CommonAlertContent
            text={"식단을 완료했어요\n체형이나 체중변화가 있었나요?"}
            subText={"더 정확한 식단을 위해\n목표칼로리를 재설정해주세요"}
          />
        )}
        onConfirm={() => {
          router.replace({
            pathname: "/(tabs)",
          });
          Promise.resolve().then(() => {
            router.push({
              pathname: "/UserInput",
              params: { from: "Checklist" },
            });
          });
        }}
        NoOfBtn={2}
        onCancel={() => dispatch(closeModal({ name: "changeTargetAlert" }))}
        style={{ width: 280 }}
      />
    </Container>
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
