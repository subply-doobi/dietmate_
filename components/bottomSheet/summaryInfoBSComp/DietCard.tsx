import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import styled from "styled-components/native";
import Icon from "@/shared/ui/Icon";
import { IDietDetailProductData } from "@/shared/api/types/diet";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import {
  useListDietTotalObj,
  useDeleteDietDetail,
  useCreateDietDetail,
} from "@/shared/api/queries/diet";
import {
  snapBS,
  setSummaryInfoPToRemove,
  setSummaryInfoPToAdd,
  setPChangeStep,
  minusQty,
  plusQty,
} from "@/features/reduxSlices/bottomSheetSlice";
import { scrollCarouselTo } from "@/features/reduxSlices/formulaSlice";
import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import { useRouter } from "expo-router";
import DietCardCta from "./DietCardCta";
import DietCardChangeBtn from "./DietCardChangeBtn";
import ProductRow from "./ProductRow";

interface DietCardProps {
  dietNo: string;
  label: string;
  regrouped: Record<string, IDietDetailProductData[]>;
  sellers: string[];
  qty: number;
  isChanged: boolean;
}

const DietCard = ({
  dietNo,
  label,
  regrouped,
  sellers,
  qty,
  isChanged,
}: DietCardProps) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const decisions = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.ctaDecisions
  );
  const decision = decisions[dietNo];
  const selectedPMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.selectedPMap
  );
  const selected = selectedPMap[dietNo];
  const pToRemove = selected?.pToRemove;
  const pToAdd = selected?.pToAdd;
  const pChangeStep = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.pChangeStep
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietDetailMutation = useDeleteDietDetail();
  const createDietDetailMutation = useCreateDietDetail();
  const menuIdx = Object.keys(dTOData || {}).indexOf(dietNo);
  const menuPrice = sumUpPrice(dTOData?.[dietNo]?.dietDetail || []);

  const isEmpty = sellers.length === 0;

  // fn
  const moveToMenu = () => {
    dispatch(
      snapBS({
        index: 0,
        bsNm: "summaryInfo",
        from: "DietCard.tsx",
      })
    );
    setTimeout(() => {
      dispatch(scrollCarouselTo({ index: menuIdx, from: "DietCard.tsx" }));
    }, 300);
  };

  const onSelect = (isSelected: boolean, product: IDietDetailProductData) => {
    if (isSelected) {
      dispatch(setSummaryInfoPToRemove(null));
    } else {
      dispatch(
        setSummaryInfoPToRemove({
          dietNo,
          product,
        })
      );
    }
  };

  // confirm step logic: show separate SelectedBox (non-clickable) for replacement preview
  const isReadyToChange = !!pToRemove && !!pToAdd;
  const showConfirmBox = pChangeStep === "showCandidates" && isReadyToChange;

  return (
    <Card>
      <HeaderRow isEmpty={isEmpty}>
        <QtyBtn
          onPress={() => dispatch(minusQty({ dietNo }))}
          disabled={isEmpty}
        >
          <Icon
            boxSize={32}
            iconSize={20}
            name="minusSquare"
            color={qty <= 1 ? colors.inactive : colors.white}
          />
        </QtyBtn>
        <MenuBtn onPress={moveToMenu}>
          <DietTitle>{label}</DietTitle>
          <QtyValue style={{ color: colors.textSub }}>{`(${commaToNum(
            menuPrice
          )}원)`}</QtyValue>
          <QtyValue isChanged={isChanged}>{`x${qty}`}</QtyValue>
        </MenuBtn>
        <QtyBtn
          onPress={() => dispatch(plusQty({ dietNo }))}
          disabled={isEmpty}
        >
          <Icon
            boxSize={32}
            iconSize={20}
            name="plusSquare"
            color={qty >= 10 ? colors.inactive : colors.white}
          />
        </QtyBtn>
      </HeaderRow>
      <Col style={{ marginTop: 24, rowGap: 20 }}>
        {/* seller list */}
        {sellers.map((seller) => {
          const products = regrouped[seller] || [];
          return (
            <Col key={seller} style={{ rowGap: 12 }}>
              <Row style={{ columnGap: 8 }}>
                <SellerName>{seller}</SellerName>
              </Row>
              {/* product list */}
              {products.map((p: IDietDetailProductData) => {
                const isSelected =
                  pToRemove?.dietNo === dietNo &&
                  pToRemove?.product?.productNo === p.productNo;

                return (
                  <Col key={p.productNo}>
                    <SelectedBox
                      onPress={() => onSelect(isSelected, p)}
                      activeOpacity={0.7}
                      isSelected={isSelected}
                    >
                      <ProductRow
                        product={p}
                        showInfo={isSelected}
                        dimmed={!!pToAdd && isSelected}
                      />
                      {/* Change CTA */}
                      {isSelected && <DietCardChangeBtn dietNo={dietNo} />}
                    </SelectedBox>
                    {/* Confirm replacement box directly under selected product */}
                    {isSelected && showConfirmBox && pToAdd && (
                      <Col>
                        <Row
                          style={{
                            justifyContent: "center",
                            marginTop: 12,
                          }}
                        >
                          <Icon
                            name="chevronDown"
                            iconSize={18}
                            boxSize={24}
                            color={colors.textSub}
                          />
                        </Row>
                        <SellerName>{pToAdd.product.platformNm}</SellerName>
                        <HorizontalSpace height={12} />
                        <ConfirmSelectedBox activeOpacity={1}>
                          <ProductRow
                            product={pToAdd.product}
                            showInfo={true}
                          />
                          <Row style={{ columnGap: 8, marginTop: 12 }}>
                            <ConfirmBtn
                              onPress={() => {
                                dispatch(setSummaryInfoPToAdd(null));
                                dispatch(setPChangeStep("showCandidates"));
                              }}
                            >
                              <BtnText style={{ color: colors.textSub }}>
                                취소
                              </BtnText>
                            </ConfirmBtn>
                            <ConfirmBtn
                              style={{ borderColor: colors.main }}
                              onPress={async () => {
                                try {
                                  await deleteDietDetailMutation.mutateAsync({
                                    dietNo,
                                    productNo: pToRemove!.product.productNo,
                                  });
                                  await createDietDetailMutation.mutateAsync({
                                    dietNo,
                                    food: pToAdd.product,
                                  });
                                  dispatch(setSummaryInfoPToRemove(null));
                                  dispatch(setSummaryInfoPToAdd(null));
                                  dispatch(setPChangeStep("standBy"));
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                            >
                              <BtnText style={{ color: colors.white }}>
                                교체하기
                              </BtnText>
                            </ConfirmBtn>
                          </Row>
                        </ConfirmSelectedBox>
                      </Col>
                    )}
                  </Col>
                );
              })}
            </Col>
          );
        })}
      </Col>
      <DietCardCta dietNo={dietNo} />
    </Card>
  );
};

export default DietCard;

const Card = styled.View`
  width: 100%;
  background-color: ${colors.blackOpacity50};
  padding: 24px 16px;
  border-radius: 16px;
`;
const HeaderRow = styled(Row)<{ isEmpty?: boolean }>`
  align-items: center;
  justify-content: ${({ isEmpty }) => (isEmpty ? "center" : "space-between")};
  height: 32px;
`;
const QtyBtn = styled.TouchableOpacity`
  display: ${({ disabled }) => (disabled ? "none" : "flex")};
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
const QtyValue = styled(TextSub)<{ isChanged?: boolean }>`
  font-size: ${({ isChanged }) => (isChanged ? "14px" : "12px")};
  line-height: 18px;
  font-weight: ${({ isChanged }) => (isChanged ? "bold" : "normal")};
  color: ${({ isChanged }) => (isChanged ? colors.green : colors.white)};
`;
const SellerName = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  margin-left: 2px;
  color: ${colors.textSub};
`;

// Selectable row styles
const SelectedBox = styled.TouchableOpacity<{ isSelected?: boolean }>`
  width: 100%;
  flex-direction: column;
  border-width: ${({ isSelected }) => (isSelected ? "1px" : "0px")};
  border-color: ${colors.line};
  border-radius: 2px;
  padding: ${({ isSelected }) => (isSelected ? "16px" : "0px")};
`;

const ConfirmSelectedBox = styled.TouchableOpacity`
  width: 100%;
  flex-direction: column;
  border-width: 1px;
  border-color: ${colors.line};
  border-radius: 2px;
  padding: 16px;
`;

const ConfirmBtn = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 4px;
  border-width: 0.5px;
  border-color: ${colors.line};
  align-items: center;
  justify-content: center;
`;
const BtnText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
  color: ${colors.white};
`;

const MenuBtn = styled.TouchableOpacity`
  flex-direction: row;
  column-gap: 8px;
  align-items: flex-end;
`;
