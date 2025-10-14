import React, { useMemo } from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import {
  getPlatformSummaries,
  getSummaryTotalsFromSummaries,
} from "@/shared/utils/dietSummary";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  Col,
  HorizontalLine,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";

import { MENU_NUM_LABEL } from "@/shared/constants";

interface DietPlatformSummaryProps {
  highlightColor?: string; // optional override for changed values
  textSize?: number; // default 12
  baseTextColor?: string; // default white
}

const Container = styled.View`
  padding: 0 16px 16px 16px;
`;

const Label = styled.Text<{ dim?: boolean; size: number }>`
  color: ${(p) => (p.dim ? colors.textSub : colors.white)};
  font-size: ${(p) => p.size}px;
`;

const Value = styled(TextMain)<{ highlight?: boolean; size: number }>`
  color: ${(p) => (p.highlight ? colors.white : colors.textSub)};
  font-size: ${(p) => (p.highlight ? p.size + 1 : p.size)}px;
  line-height: ${(p) => p.size + 4}px;
`;

const Strike = styled.Text<{ size: number }>`
  color: ${colors.textSub};
  font-size: ${(p) => p.size}px;
  text-decoration: line-through;
  margin-right: 6px;
`;

export default function DietPlatformSummary({
  highlightColor,
  textSize = 12,
  baseTextColor = colors.white,
}: DietPlatformSummaryProps) {
  const { data: dTOData } = useListDietTotalObj();
  const dietQtyMap = useAppSelector((s) => s.bottomSheet.bsData.dietQtyMap);

  const { summaries, totals } = useMemo(() => {
    const summaries = getPlatformSummaries(dTOData, dietQtyMap);
    const totals = getSummaryTotalsFromSummaries(
      summaries,
      dTOData,
      dietQtyMap
    );

    return {
      summaries,
      totals,
    };
  }, [dTOData, dietQtyMap]);

  const hasProductsChange =
    Math.round(totals.changedProductsTotal) !==
    Math.round(totals.originalProductsTotal);
  const hasShippingChange =
    Math.round(totals.changedShippingTotal) !==
    Math.round(totals.originalShippingTotal);

  if (!summaries.length) return null;

  return (
    <Container>
      <HorizontalLine />
      <Col style={{ marginTop: 8, rowGap: 12 }}>
        {summaries.map((s) => {
          const priceChanged =
            Math.round(s.changedTotalPrice) !==
            Math.round(s.originalTotalPrice);
          const shipChanged =
            s.changedShippingPrice !== s.originalShippingPrice;
          return (
            <Col key={s.platformNm} style={{ rowGap: 4 }}>
              {/* 1st line: platformNm */}
              <Label size={textSize} style={{ color: colors.white }}>
                {s.platformNm}
              </Label>
              {/* 2nd line: 식품 : price */}
              <Col>
                <Row
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Row style={{ alignItems: "center" }}>
                    <Label
                      size={textSize}
                      style={{
                        color: baseTextColor,
                        // minWidth: 40,
                        marginRight: 8,
                      }}
                    >
                      식품 :
                    </Label>
                    {priceChanged && (
                      <Strike size={textSize}>
                        {Math.round(s.originalTotalPrice).toLocaleString()}원
                      </Strike>
                    )}
                    <Value
                      size={textSize}
                      highlight={priceChanged}
                      style={
                        highlightColor
                          ? {
                              color: priceChanged
                                ? highlightColor
                                : baseTextColor,
                            }
                          : undefined
                      }
                    >
                      {Math.round(s.changedTotalPrice).toLocaleString()}원
                    </Value>
                  </Row>
                  {/* 3rd line: 배송비 : shippingPrice (~원 더 구매시 무료) */}
                  <Row style={{ alignItems: "center" }}>
                    <Label
                      size={textSize}
                      style={{
                        color: baseTextColor,
                        // minWidth: 40,
                      }}
                    >
                      배송비:{" "}
                    </Label>
                    {shipChanged && (
                      <Strike size={textSize}>
                        {s.originalShippingPrice === 0
                          ? "무료"
                          : `${Math.round(
                              s.originalShippingPrice
                            ).toLocaleString()}원`}
                      </Strike>
                    )}
                    <Value
                      size={textSize}
                      highlight={shipChanged}
                      style={
                        highlightColor
                          ? {
                              color: shipChanged
                                ? highlightColor
                                : baseTextColor,
                            }
                          : undefined
                      }
                    >
                      {s.changedShippingPrice === 0
                        ? "무료"
                        : `${Math.round(
                            s.changedShippingPrice
                          ).toLocaleString()}원`}
                    </Value>
                    {/* Remain to Free - only show if shipping is not already free and remain > 0 */}
                    {s.changedShippingPrice > 0 &&
                      s.changedRemainToFree > 0 && (
                        <Label size={textSize} dim>
                          {" "}
                          ({Math.round(s.changedRemainToFree).toLocaleString()}
                          원 더 구매시 무료)
                        </Label>
                      )}
                  </Row>
                </Row>
              </Col>
            </Col>
          );
        })}
      </Col>
      {/* Totals section at the bottom, styled as before */}
      <HorizontalLine style={{ marginTop: 8 }} />
      <Row
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {/* Left: 총 상품금액 */}
        <Row style={{ alignItems: "center" }}>
          <TextSub
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: colors.textSub,
              marginRight: 4,
            }}
          >
            총"{MENU_NUM_LABEL[totals.menuNumTotal - 1]}"
          </TextSub>
          {hasProductsChange && (
            <TextSub
              style={{
                fontSize: 12,
                lineHeight: 16,
                color: colors.textSub,
                textDecorationLine: "line-through",
                marginRight: 4,
              }}
            >
              {Math.round(totals.originalProductsTotal).toLocaleString()}원
            </TextSub>
          )}
          <TextMain
            style={{
              fontSize: hasProductsChange ? 13 : 12,
              lineHeight: 16,
              color: colors.white,
            }}
          >
            {Math.round(totals.changedProductsTotal).toLocaleString()}원
          </TextMain>
        </Row>
        {/* Right: 총 배송비 */}
        <Row style={{ alignItems: "center" }}>
          <TextSub
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: colors.textSub,
              marginRight: 4,
            }}
          >
            총 배송비
          </TextSub>
          {hasShippingChange && (
            <TextSub
              style={{
                fontSize: 12,
                lineHeight: 16,
                color: colors.textSub,
                textDecorationLine: "line-through",
                marginRight: 4,
              }}
            >
              {Math.round(totals.originalShippingTotal).toLocaleString()}원
            </TextSub>
          )}
          <TextMain
            style={{
              fontSize: hasShippingChange ? 13 : 12,
              lineHeight: 16,
              color: colors.white,
            }}
          >
            {Math.round(totals.changedShippingTotal).toLocaleString()}원
          </TextMain>
        </Row>
      </Row>
    </Container>
  );
}
