// RN
import { useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import colors from "../shared/colors";
import { HorizontalSpace } from "../shared/ui/styledComps";
import DAccordionHeader from "../shared/ui/DAccordionHeader";
import { getHistoryDetailAcContent } from "../shared/utils/screens/orderHistoryDetail/contents";
import Accordion from "react-native-collapsible/Accordion";
import { useLocalSearchParams, useNavigation } from "expo-router";

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
              arrow={content.title === "공식"}
              customComponent={() => content.headerContent}
            />
          )}
          renderContent={(content, index, isActive) => content.content}
          onChange={(a) =>
            (a[0] === undefined || acContent[a[0]].title === "공식") &&
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
