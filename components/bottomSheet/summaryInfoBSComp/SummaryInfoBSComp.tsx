import {
  useListDietTotalObj,
  useUpdateDietDetail,
} from "@/shared/api/queries/diet";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import colors from "@/shared/colors";
import styled from "styled-components/native";
import { useMemo, useState, useEffect, useRef } from "react";
import { ENV, MENU_LABEL } from "@/shared/constants";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import { Image } from "react-native";
import CartSummary from "../../screens/diet/CartSummary";
import Icon from "@/shared/ui/Icon";

const SummaryInfoBSComp = () => {
  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const updateDietDetailMutation = useUpdateDietDetail();

  // useMemo
  const dietEntries = useMemo(() => {
    if (!dTOData)
      return [] as Array<{
        dietNo: string;
        label: string;
        regrouped: Record<string, IDietDetailProductData[]>;
        sellers: string[];
        qtyNums: number[]; // raw qty numbers per product
      }>;
    const keys = Object.keys(dTOData);
    return keys.map((dietNo, idx) => {
      const dietDetail =
        (dTOData as IDietTotalObjData)[dietNo]?.dietDetail || [];
      const regrouped = regroupDDataBySeller(dietDetail);
      const sellers = Object.keys(regrouped);
      const qtyNums = dietDetail.map((d) => parseInt(d.qty));
      return {
        dietNo,
        label: MENU_LABEL[idx] || `식단 ${idx + 1}`,
        regrouped,
        sellers,
        qtyNums,
      };
    });
  }, [dTOData]);

  // qty state per diet (1-10)
  const [dietQtyMap, setDietQtyMap] = useState<Record<string, number>>({});
  const [changedDietNos, setChangedDietNos] = useState<string[]>([]);
  const originalDietQtyMapRef = useRef<Record<string, number>>({});

  // Sync qty state when backend data changes
  useEffect(() => {
    if (!dTOData) {
      setDietQtyMap({});
      originalDietQtyMapRef.current = {};
      setChangedDietNos([]);
      return;
    }
    const nextQtyMap: Record<string, number> = {};
    dietEntries.forEach((diet) => {
      // If all product qtys are the same, use that; else use first product's qty as representative
      if (diet.qtyNums.length === 0) {
        nextQtyMap[diet.dietNo] = 1;
      } else {
        const allSame = diet.qtyNums.every((q) => q === diet.qtyNums[0]);
        nextQtyMap[diet.dietNo] = allSame ? diet.qtyNums[0] : diet.qtyNums[0];
      }
    });
    setDietQtyMap(nextQtyMap);
    originalDietQtyMapRef.current = nextQtyMap; // reset originals to new snapshot
    setChangedDietNos([]);
  }, [dTOData, dietEntries]);

  // Update changed dietNos when qty state mutates
  useEffect(() => {
    const originals = originalDietQtyMapRef.current;
    const changed = Object.keys(dietQtyMap).filter(
      (dietNo) => dietQtyMap[dietNo] !== originals[dietNo]
    );
    setChangedDietNos(changed);
  }, [dietQtyMap]);

  const handleMinus = (dietNo: string) => {
    setDietQtyMap((prev) => {
      const cur = prev[dietNo] ?? 1;
      const next = Math.max(1, cur - 1);
      if (next === cur) return prev;
      return { ...prev, [dietNo]: next };
    });
  };
  const handlePlus = (dietNo: string) => {
    setDietQtyMap((prev) => {
      const cur = prev[dietNo] ?? 1;
      const next = Math.min(10, cur + 1);
      if (next === cur) return prev;
      return { ...prev, [dietNo]: next };
    });
  };

  return (
    <Container>
      <Col style={{ width: "100%", rowGap: 48 }}>
        {dietEntries.map((diet) => {
          const qty = dietQtyMap[diet.dietNo] ?? 1;
          const isChanged = changedDietNos.includes(diet.dietNo);
          return (
            <Col key={diet.dietNo} style={{ width: "100%" }}>
              <HeaderRow>
                <QtyBtn
                  disabled={qty <= 1}
                  onPress={() => handleMinus(diet.dietNo)}
                >
                  <Icon
                    boxSize={32}
                    iconSize={20}
                    name="minusSquare"
                    color={qty <= 1 ? colors.inactive : colors.white}
                  />
                </QtyBtn>
                <Row style={{ columnGap: 8, alignItems: "center" }}>
                  <DietTitle>{diet.label}</DietTitle>
                  <QtyValue>{`x${qty}`}</QtyValue>
                </Row>
                <QtyBtn
                  disabled={qty >= 10}
                  onPress={() => handlePlus(diet.dietNo)}
                >
                  <Icon
                    boxSize={32}
                    iconSize={20}
                    name="plusSquare"
                    color={qty >= 10 ? colors.inactive : colors.white}
                  />
                </QtyBtn>
              </HeaderRow>
              {isChanged && (
                <OpacityBox>
                  <Btn
                    onPress={() => {
                      const originals = originalDietQtyMapRef.current;
                      setDietQtyMap((prev) => ({
                        ...prev,
                        [diet.dietNo]: originals[diet.dietNo] || 1,
                      }));
                    }}
                  >
                    <SaveBtnText>취소</SaveBtnText>
                  </Btn>
                  <Btn
                    onPress={() => {
                      updateDietDetailMutation.mutate({
                        dietNo: diet.dietNo,
                        qty: String(qty),
                      });
                    }}
                    style={{ backgroundColor: colors.white }}
                  >
                    <SaveBtnText style={{ color: colors.black }}>
                      저장하기
                    </SaveBtnText>
                  </Btn>
                </OpacityBox>
              )}
              {diet.sellers.length === 0 ? (
                <EmptyText>식품을 추가해봐요</EmptyText>
              ) : (
                <Col style={{ marginTop: 24, rowGap: 20 }}>
                  {diet.sellers.map((seller) => {
                    const products = diet.regrouped[seller] || [];
                    return (
                      <Col key={seller} style={{ rowGap: 12 }}>
                        <SellerName>{seller}</SellerName>
                        {products.map((p: IDietDetailProductData) => (
                          <ProductRow key={p.productNo}>
                            <ThumbWrapper>
                              {p.mainAttUrl ? (
                                <Thumb
                                  source={{
                                    uri: `${ENV.BASE_URL}${p.mainAttUrl}`,
                                  }}
                                />
                              ) : (
                                <ThumbPlaceholder />
                              )}
                            </ThumbWrapper>
                            <Col style={{ flex: 1, rowGap: 2 }}>
                              <ProductName
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {p.productNm}
                              </ProductName>
                              <Price>{commaToNum(p.price)}원</Price>
                            </Col>
                          </ProductRow>
                        ))}
                      </Col>
                    );
                  })}
                </Col>
              )}
            </Col>
          );
        })}
      </Col>
    </Container>
  );
};

export default SummaryInfoBSComp;

// Styled Components
const Container = styled.View`
  width: 100%;
  padding: 0 16px 64px 16px;
`;

const HeaderRow = styled(Row)`
  align-items: center;
  justify-content: space-between;
  height: 32px;
`;

const QtyBtn = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

const DietTitle = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  font-weight: bold;
  color: ${colors.white};
`;
const QtyValue = styled(TextSub)`
  font-size: 12px;
  line-height: 14px;
  color: ${colors.white};
`;

const OpacityBox = styled.View`
  flex-direction: row;
  flex: 1;
  height: 64px;
  background-color: ${colors.blackOpacity80};
  border-radius: 4px;
  margin-top: 16px;
  margin-bottom: -80px;
  padding: 0 8px;
  align-items: center;
  column-gap: 8px;
  z-index: 10;
`;

const Btn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  justify-content: center;
  align-items: center;
  background-color: ${colors.black};
  border-radius: 6px;
`;

const SaveBtnText = styled(TextMain)`
  color: ${colors.white};
  font-size: 14px;
  line-height: 18px;
`;

const SellerName = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 2px;
  color: ${colors.textSub};
`;

const ProductRow = styled(Row)`
  align-items: center;
  column-gap: 8px;
`;

const ThumbWrapper = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${colors.blackOpacity80};
`;
const Thumb = styled(Image)`
  width: 100%;
  height: 100%;
`;
const ThumbPlaceholder = styled.View`
  flex: 1;
  background-color: ${colors.line};
`;

const ProductName = styled(TextMain)`
  font-size: 12px;
  line-height: 14px;
  color: ${colors.white};
`;
const Price = styled(TextSub)`
  font-size: 12px;
  line-height: 14px;
  color: ${colors.textSub};
`;

const EmptyText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${colors.textSub};
  margin-top: 24px;
`;
