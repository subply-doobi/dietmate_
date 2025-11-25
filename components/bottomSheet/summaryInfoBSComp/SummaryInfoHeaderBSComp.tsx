import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { MENU_KIND_LABEL, MENU_NUM_LABEL } from "@/shared/constants";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { getSummaryTotals } from "@/shared/utils/dietSummary";
import { checkNoStockPAll } from "@/shared/utils/productStatusCheck";
import { commaToNum, getNutrStatus } from "@/shared/utils/sumUp";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import styled from "styled-components/native";
import OrderCtaButton from "./OrderCtaButton";

const SummaryInfoHeaderBSComp = () => {
  // navigation
  const router = useRouter();

  // redux
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const bsIndex = useAppSelector(
    (state) => state.bottomSheet.currentValue.index
  );

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { priceText, menuKindNumText, menuNumText, isAllSuccess } =
    useMemo(() => {
      // 총 끼니 수, 상품 수, 금액 계산
      const { menuNumTotal: menuNum, changedProductsTotal: priceTotal } =
        getSummaryTotals(dTOData);

      const menuKindNum = dTOData ? Object.keys(dTOData).length : 0;
      const menuKindNumText = `(${MENU_KIND_LABEL[menuKindNum - 1]} 근)`;
      const menuNumText =
        priceTotal > 0
          ? `공식에 총 ${MENU_NUM_LABEL[menuNum - 1]}이 있어요`
          : "식품을 담아보세요";

      const priceText =
        menuNum > 0 && priceTotal > 0
          ? `근 당 ${commaToNum(Math.floor(priceTotal / menuNum))} 원`
          : "";

      if (!dTOData) {
        return {
          priceText,
          menuKindNumText,
          menuNumText,
          isAllSuccess: false,
        };
      }
      const isSuccessArr = Object.values(dTOData).map((item) => {
        const { dietDetail } = item;
        const isSuccess = getNutrStatus({
          bLData: bLData,
          dDData: dietDetail,
          totalFoodList: totalFoodList,
        });
        return isSuccess;
      });
      const isAllSuccess = isSuccessArr.every((item) => item === "satisfied");

      return {
        priceText,
        menuKindNumText,
        menuNumText,
        isAllSuccess,
      };
    }, [dTOData]);
  return (
    <Box>
      <Row style={{ justifyContent: "space-between" }}>
        <SummaryText $color={colors.white}>
          {menuNumText}
          <SummaryText
            $color={colors.textSub}
            style={{ fontSize: 12, lineHeight: 16 }}
          >
            {" "}
            {menuKindNumText}
          </SummaryText>
        </SummaryText>
        <SummaryValue $color={colors.white}>{priceText}</SummaryValue>
      </Row>
      <HorizontalSpace height={8} />
      {bsIndex === 0 && <OrderCtaButton />}
    </Box>
  );
};

export default SummaryInfoHeaderBSComp;

const Box = styled.View`
  padding: 0px 16px 0 16px;
`;

const SummaryText = styled(TextMain)<{ $color?: string }>`
  font-size: 12px;
  line-height: 16px;
  color: ${({ $color }) => $color || colors.textMain};
`;

const SummaryValue = styled(TextMain)<{ $color?: string }>`
  font-size: 12px;
  font-weight: bold;
  color: ${({ $color }) => $color || colors.textMain};
`;
