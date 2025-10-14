import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import styled from "styled-components/native";
import { useCallback, useMemo } from "react";
import { MENU_LABEL } from "@/shared/constants";
import { Col, TextSub } from "@/shared/ui/styledComps";
import { plusQty, minusQty } from "@/features/reduxSlices/bottomSheetSlice";
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

const SummaryInfoBSComp = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const dietQtyMap = useAppSelector(
    (state) => state.bottomSheet.bsData.dietQtyMap
  );
  const changedDietNoArr = useAppSelector(
    (state) => state.bottomSheet.bsData.changedDietNoArr
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const createDietMutation = useCreateDiet();

  // useMemo
  const {
    dietEntries,
    emptyMenuNum,
    firstTargetSeller,
    remainToFree,
    totalMenuNum,
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
      };
    const emptyMenuNum = getEmptyMenuNum(dTOData);
    const summaryArr = getPlatformSummaries(dTOData);
    const totals = getSummaryTotalsFromSummaries(summaryArr, dTOData);
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
    };
  }, [dTOData]);

  const handleMinus = (dietNo: string) => {
    dispatch(minusQty({ dietNo }));
  };
  const handlePlus = (dietNo: string) => {
    dispatch(plusQty({ dietNo }));
  };

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
            onMinus={handleMinus}
            onPlus={handlePlus}
          />
        ))}
      </Col>
      {emptyMenuNum !== undefined &&
        emptyMenuNum === 0 &&
        totalMenuNum < MENU_LABEL.length &&
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
