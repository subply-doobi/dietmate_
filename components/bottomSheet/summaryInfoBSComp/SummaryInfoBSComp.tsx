import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import styled from "styled-components/native";
import { useCallback, useMemo, useEffect } from "react";
import {
  MENU_KIND_LABEL,
  MENU_LABEL,
  MENU_NUM_LABEL,
} from "@/shared/constants";
import { Col, TextSub } from "@/shared/ui/styledComps";
import {
  plusQty,
  minusQty,
  setLoweringCtaDecision,
} from "@/features/reduxSlices/bottomSheetSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import DietCard from "./DietCard";
import colors from "@/shared/colors";
import { commaToNum, getEmptyMenuNum } from "@/shared/utils/sumUp";
import {
  getPlatformSummaries,
  getSummaryTotalsFromSummaries,
} from "@/shared/utils/dietSummary";
import { useRouter } from "expo-router";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { determineCtaTypesForAllMenus } from "@/shared/utils/ctaDecision";
import ConfirmChangeCard from "./ConfirmChangeCard";

const SummaryInfoBSComp = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const dietQtyMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.dietQtyMap
  );
  const originalDietQtyMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.originalDietQtyMap
  );
  const changedDietNoArr = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.changedDietNoArr
  );
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const selectedPMap = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.selectedPMap
  );
  const pChangeStep = useAppSelector(
    (state) => state.bottomSheet.bsData.summaryInfo.pChangeStep
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const { data: bLData } = useGetBaseLine();
  const createDietMutation = useCreateDiet();

  // useMemo - compute platform summaries and diet entries
  const {
    dietEntries,
    emptyMenuNum,
    firstTargetSeller,
    remainToFree,
    totalMenuNum,
    summaryTotals,
  } = useMemo(() => {
    if (!dTOData)
      return {
        dietEntries: [] as Array<{
          dietNo: string;
          label: string;
          regrouped: Record<string, IDietDetailProductData[]>;
          sellers: string[];
        }>,
        emptyMenuNum: undefined,
        summaryTotals: undefined,
      };

    const emptyMenuNum = getEmptyMenuNum(dTOData);

    const summaryArr = getPlatformSummaries(
      dTOData,
      changedDietNoArr.length > 0 ? dietQtyMap : undefined
    );
    const totals = getSummaryTotalsFromSummaries(
      summaryArr,
      dTOData,
      changedDietNoArr.length > 0 ? dietQtyMap : undefined
    );
    const sellers = summaryArr.map((s) => s.platformNm);
    const totalMenuNum = totals.menuNumTotal;

    const firstTargetSeller = summaryArr[0]?.platformNm || "";
    const remainToFree = summaryArr[0]?.changedRemainToFree || 0;

    const keys = Object.keys(dTOData);
    const dietEntries = keys.map((dietNo, idx) => {
      const dietDetail =
        (dTOData as IDietTotalObjData)[dietNo]?.dietDetail || [];
      const { regrouped, sellers: filteredSellers } = regroupDDataBySeller(
        dietDetail,
        sellers
      );
      return {
        dietNo,
        label: MENU_LABEL[idx] || `식단 ${idx + 1}`,
        regrouped,
        sellers: filteredSellers,
      };
    });
    return {
      dietEntries,
      emptyMenuNum,
      firstTargetSeller,
      remainToFree,
      totalMenuNum,
      summaryTotals: totals,
    };
  }, [dTOData, dietQtyMap]);

  // Compute and store CTA decisions per menu whenever dTOData or dietQtyMap changes
  useEffect(() => {
    if (!dTOData || !bLData || !summaryTotals) return;

    // Get CTA decisions for all menus at once
    const ctaDecisions = determineCtaTypesForAllMenus({
      dTOData,
      freeShippingTarget: summaryTotals.freeShippingTarget,
      alreadyFreeShipping: summaryTotals.alreadyFreeShipping,
      dietQtyMap,
      originalDietQtyMap,
      baseLine: bLData,
      totalFoodList,
      totalMenuNum,
    });

    dispatch(setLoweringCtaDecision(ctaDecisions));
  }, [dTOData, dietQtyMap, bLData, totalFoodList, totalMenuNum, summaryTotals]);

  // fn
  const addFirstTargetSeller = useCallback(async () => {
    if (!firstTargetSeller) return;
    const res = await createDietMutation.mutateAsync();
    dispatch(setCurrentFMCIdx(totalMenuNum - 1));
    router.push({
      pathname: "/AutoAdd",
      params: {
        menu: JSON.stringify([]),
        initialSortFilter: JSON.stringify({ platformNm: [firstTargetSeller] }),
      },
    });
  }, [firstTargetSeller]);

  // Check if any diet is in confirm step
  const confirmDietNo = Object.keys(selectedPMap).find((dietNo) => {
    const selected = selectedPMap[dietNo];
    return (
      pChangeStep === "showCandidates" &&
      selected?.pToRemove &&
      selected?.pToAdd
    );
  });

  return (
    <Container>
      <Col style={{ width: "100%", rowGap: 48 }}>
        {dietEntries.map((diet) => (
          <DietCard
            key={diet.dietNo}
            dietNo={diet.dietNo}
            label={diet.label}
            regrouped={diet.regrouped}
            sellers={diet.sellers}
            qty={dietQtyMap[diet.dietNo] ?? 1}
            isChanged={changedDietNoArr.includes(diet.dietNo)}
          />
        ))}
      </Col>
      {/* Show confirm change card when in confirm step */}
      {confirmDietNo && <ConfirmChangeCard dietNo={confirmDietNo} />}
      {emptyMenuNum !== undefined &&
        emptyMenuNum === 0 &&
        totalMenuNum < MENU_NUM_LABEL.length &&
        changedDietNoArr.length === 0 &&
        firstTargetSeller && (
          <NewMenuBtn onPress={addFirstTargetSeller}>
            <BtnText>
              새로운 근에{" "}
              <BtnText style={{ color: colors.green }}>
                "{firstTargetSeller}"
              </BtnText>{" "}
              식품 추가해서 배송비 줄이기
            </BtnText>
            <BtnText style={{ color: colors.textSub }}>
              ({commaToNum(remainToFree)}원 더 담으면 "{firstTargetSeller}"
              무료배송)
            </BtnText>
          </NewMenuBtn>
        )}
    </Container>
  );
};

export default SummaryInfoBSComp;
// Styled Components
const Container = styled.View`
  width: 100%;
  padding: 40px 16px 56px 16px;
`;

const NewMenuBtn = styled.TouchableOpacity`
  width: 100%;
  height: 52 px;
  background-color: ${colors.blackOpacity50};
  margin-top: 40px;
  padding: 24px 16px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.line};
  align-items: center;
  justify-content: center;
`;

const BtnText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${colors.white};
`;
