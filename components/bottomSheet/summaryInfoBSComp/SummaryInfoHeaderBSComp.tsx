import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { MENU_NUM_LABEL } from "@/shared/constants";
import {
  HorizontalLine,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { getSummaryTotals } from "@/shared/utils/dietSummary";
import { commaToNum } from "@/shared/utils/sumUp";
import { useMemo } from "react";
import styled from "styled-components/native";

const SummaryInfoHeaderBSComp = () => {
  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { menuNumText, priceText } = useMemo(() => {
    // 총 끼니 수, 상품 수, 금액 계산
    const { menuNumTotal: menuNum, changedProductsTotal: priceTotal } =
      getSummaryTotals(dTOData);

    const menuNumText =
      priceTotal > 0
        ? `공식에 전체 ${MENU_NUM_LABEL[menuNum - 1]}이 있어요`
        : `식품을 추가해봐요`;

    const priceText =
      menuNum > 0 && priceTotal > 0
        ? `근 당 ${commaToNum(Math.floor(priceTotal / menuNum))} 원`
        : "";
    return {
      menuNumText,
      priceText,
    };
  }, [dTOData]);

  return (
    <Box>
      <Row style={{ justifyContent: "space-between" }}>
        <SummaryText $color={colors.white}>{menuNumText}</SummaryText>
        <SummaryValue $color={colors.white}>{priceText}</SummaryValue>
      </Row>
      <HorizontalLine style={{ marginTop: 8 }} />
    </Box>
  );
};

export default SummaryInfoHeaderBSComp;

const Box = styled.View`
  padding: 16px 16px 0 16px;
`;

const SummaryText = styled(TextMain)<{ $color?: string }>`
  font-size: 14px;
  line-height: 20px;
  color: ${({ $color }) => $color || colors.textMain};
`;

const SummaryValue = styled(TextMain)<{ $color?: string }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ $color }) => $color || colors.textMain};
`;
