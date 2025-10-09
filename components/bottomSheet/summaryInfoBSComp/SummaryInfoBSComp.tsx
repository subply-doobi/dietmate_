import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import {
  IDietDetailProductData,
  IDietTotalObjData,
} from "@/shared/api/types/diet";
import styled from "styled-components/native";
import { useMemo } from "react";
import { MENU_LABEL } from "@/shared/constants";
import { Col } from "@/shared/ui/styledComps";
import { plusQty, minusQty } from "@/features/reduxSlices/bottomSheetSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import DietCard from "./DietCard";

const SummaryInfoBSComp = () => {
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

  const handleMinus = (dietNo: string) => {
    dispatch(minusQty({ dietNo }));
  };
  const handlePlus = (dietNo: string) => {
    dispatch(plusQty({ dietNo }));
  };

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
    </Container>
  );
};

export default SummaryInfoBSComp;
// Styled Components
const Container = styled.View`
  width: 100%;
  padding: 40px 16px 56px 16px;
`;
