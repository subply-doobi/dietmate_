// RN
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import colors from "../shared/colors";
import { IOrderedProduct } from "../shared/api/types/order";
import { TextMain, TextSub, HorizontalSpace } from "../shared/ui/styledComps";
import DAccordionHeader from "../shared/ui/DAccordionHeader";
import { getHistoryDetailAcContent } from "../shared/utils/screens/orderHistoryDetail/contents";
import Accordion from "react-native-collapsible/Accordion";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

// main component
const OrderHistoryDetail = () => {
  // navigation
  const navigation = useNavigation();
  const { orderDetailData: orderDDataJString, totalPrice } =
    useLocalSearchParams();
  const orderDetailData =
    orderDDataJString && JSON.parse(orderDDataJString as string);

  // useState
  const [activeSection, setActiveSection] = useState<number[]>([]);

  // useMemo
  const acContent = getHistoryDetailAcContent(
    orderDetailData,
    totalPrice as string
  );
  console.log("OrderhistoryDetail acContent", acContent);
  // useEffect
  useEffect(() => {
    orderDetailData &&
      navigation.setOptions({
        title: orderDetailData[0][0]?.buyDate,
      });
  }, []);

  return (
    <Container>
      <ScrollView>
        <HorizontalSpace height={40} />
        <Accordion
          sections={acContent}
          containerStyle={{ rowGap: 24, paddingBottom: 64 }}
          activeSections={activeSection}
          renderHeader={(content, index, isActive) => (
            <DAccordionHeader
              title={content.title}
              isActive={isActive}
              subTitle={content.subTitle}
              arrow={content.title === "주문식품"}
              customComponent={() => content.headerContent}
            />
          )}
          renderContent={(content, index, isActive) => content.content}
          onChange={(a) =>
            (a[0] === undefined || acContent[a[0]].title === "주문식품") &&
            setActiveSection(a)
          }
          touchableComponent={Pressable}
        />
      </ScrollView>
    </Container>
  );
};

export default OrderHistoryDetail;

const Container = styled.View`
  flex: 1;
  background-color: ${colors.backgroundLight2};
`;
