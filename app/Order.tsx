// RN, expo
import { useMemo, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";

// 3rd
import Accordion from "react-native-collapsible/Accordion";
import { useRouter } from "expo-router";

// doobi
import { useCreateOrder } from "@/shared/api/queries/order";
import { useListAddress } from "@/shared/api/queries/address";
import { useGetUser } from "@/shared/api/queries/user";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

import {
  setCustomData,
  setPayParams,
} from "@/shared/utils/screens/order/setPayData";
import { commaToNum, sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { getOrderAccordionContent } from "@/shared/utils/screens/order/orderAccordion";
import { tfDTOToDDA } from "@/shared/utils/dataTransform";

import colors from "@/shared/colors";
import { BOTTOM_INDICATOR_IOS, SCREENWIDTH } from "@/shared/constants";
import { PAY_METHOD } from "@/shared/utils/screens/order/payConsts";
import BusinessInfo from "@/components/common/businessInfo/BusinessInfo";
import CtaButton from "@/shared/ui/CtaButton";
import { Container, HorizontalSpace } from "@/shared/ui/styledComps";

const Order = () => {
  //navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const { foodToOrder, selectedAddrIdx, shippingPrice } = useAppSelector(
    (state) => state.order
  );
  const { buyerName, buyerTel, entranceType, entranceNote, paymentMethod, pg } =
    useAppSelector((state) => state.userInput);

  // useState
  const [activeSections, setActiveSections] = useState<number[]>([]);

  // react-query
  const { data: listAddressData, isLoading: listAddressDataLoading } =
    useListAddress();
  const { data: userData } = useGetUser();
  const createOrderMutation = useCreateOrder();

  // useMemo
  const {
    priceTotal,
    menuNum,
    productNum,
    dietDetailAllData,
    accordionContent,
  } = useMemo(() => {
    const { priceTotal, menuNum, productNum } =
      sumUpDietFromDTOData(foodToOrder);
    const dietDetailAllData = tfDTOToDDA(foodToOrder);

    const currentPayMethodItem = PAY_METHOD.find(
      (item) => item.value === paymentMethod.value
    );
    const accordionContent = getOrderAccordionContent({
      menuNum,
      productNum,
      buyerName,
      buyerTel,
      listAddressData,
      selectedAddrIdx,
      currentPayMethodItem,
      pg,
      priceTotal,
      shippingPrice,
    });

    return {
      priceTotal,
      menuNum,
      productNum,
      dietDetailAllData,
      accordionContent,
    };
  }, [foodToOrder, listAddressData, activeSections]);

  // validation
  const invalidateInput = [buyerName, buyerTel, paymentMethod].find(
    (v) => !v.isValid
  );
  const validationErrMsg = !listAddressData
    ? "잠시만 기다려주세요"
    : invalidateInput
    ? invalidateInput.errMsg
    : listAddressData.length === 0
    ? "주소를 입력해주세요"
    : listAddressData[selectedAddrIdx]?.addr1 === ""
    ? "주소를 입력해주세요"
    : listAddressData[selectedAddrIdx]?.addr2 === ""
    ? "상세주소를 입력해주세요"
    : ``;
  const ctaBtnStyle = validationErrMsg === "" ? "active" : "inactive";
  const ctaBtnText =
    validationErrMsg === ""
      ? `총 ${commaToNum(priceTotal + shippingPrice)}원 결제하기`
      : validationErrMsg;

  // order Btn action
  const onHandleOrder = async () => {
    if (!listAddressData || !userData) return;
    if (validationErrMsg !== "") return;

    const customData = setCustomData({
      priceTotal,
      shippingPrice,
      buyerName: buyerName.value,
      buyerTel: buyerTel.value,
      listAddressData,
      selectedAddrIdx,
      entranceType: entranceType.value,
      entranceNote: entranceNote.value,
      dietDetailAllData,
    });

    // Iamport payment params
    const { payParams_doobi, payParams_iamport } = setPayParams({
      userData,
      paymentMethod: paymentMethod.value,
      pg: pg.value,
      menuNum,
      productNum,
      priceTotal,
      shippingPrice,
      buyerName: buyerName.value,
      buyerTel: buyerTel.value,
      listAddressData,
      selectedAddrIdx,
      customData,
    });

    const orderNo = (await createOrderMutation.mutateAsync(payParams_doobi))
      .orderNo;

    router.push({
      pathname: "/Payment",
      params: { payParams_iamport: JSON.stringify(payParams_iamport), orderNo },
    });
  };

  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;

  return listAddressDataLoading ? (
    <Container style={{ justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="small" color={colors.main} />
    </Container>
  ) : (
    <Container
      style={{
        paddingRight: 0,
        paddingLeft: 0,
        backgroundColor: colors.backgroundLight2,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Accordion
          containerStyle={{ marginTop: 16 }}
          activeSections={activeSections}
          sections={accordionContent}
          touchableComponent={TouchableOpacity}
          renderHeader={(content, index, isActive) =>
            isActive ? content.activeHeader : content.inActiveHeader
          }
          renderContent={(content, index, isActive) => content.content}
          duration={200}
          onChange={(activeSections) => setActiveSections(activeSections)}
          renderFooter={() => <HorizontalSpace height={16} />}
        />
        <BusinessInfo />
      </ScrollView>

      {/* 결제버튼 */}
      <CtaButton
        btnStyle={ctaBtnStyle}
        style={{
          width: SCREENWIDTH - 32,
          position: "absolute",
          bottom: insetBottom + 8,
        }}
        onPress={async () => onHandleOrder()}
        btnText={ctaBtnText}
      />
    </Container>
  );
};

export default Order;
