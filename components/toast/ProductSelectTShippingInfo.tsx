import { useListDietTotalObj } from "@/shared/api/queries/diet";
import {
  IDietDetailData,
  IDietDetailProductData,
} from "@/shared/api/types/diet";
import { IProductData } from "@/shared/api/types/product";
import colors from "@/shared/colors";
import { SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import {
  commaToNum,
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useMemo } from "react";
import styled from "styled-components/native";
import SellerShippingText from "./SellerShippingText";

const ProductSelectTShippingInfo = () => {
  // redux
  const autoAddFoodForAdd = useAppSelector(
    (state) => state.formula.autoAddFoodForAdd
  );
  const autoAddFoodForChange = useAppSelector(
    (state) => state.formula.autoAddFoodForChange
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { shippingPriceObj } = useMemo(() => {
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    return { shippingPriceObj };
  }, [dTOData]);

  // etc
  // relevantSellerNmArr no dupicates, no undefined values
  const relevantSellerNmArr = Array.from(
    new Set(
      [autoAddFoodForAdd?.platformNm, autoAddFoodForChange?.platformNm].filter(
        Boolean
      ) as string[]
    )
  );

  return (
    <Box>
      {relevantSellerNmArr.map((seller, idx) => (
        <SellerShippingText
          key={idx}
          shippingPriceObj={shippingPriceObj}
          seller={seller}
          productToAdd={autoAddFoodForAdd}
          productToDel={autoAddFoodForChange}
          mainTextColor={colors.white}
          subTextColor={colors.textSub}
        />
      ))}
    </Box>
  );
};

export default ProductSelectTShippingInfo;

const Box = styled.View`
  width: 100%;
  margin-top: 16px;
  row-gap: 16px;
`;
