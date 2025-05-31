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
import ShippingSummary, { IShippingSummaryObj } from "./ShippingSummary";

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
  const { shippingSummaryObj } = useMemo(() => {
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const delAddProductArr = [autoAddFoodForChange, autoAddFoodForAdd];

    let shippingSummaryObj: IShippingSummaryObj = {};
    for (let i = 0; i < delAddProductArr.length; i++) {
      const product = delAddProductArr[i];
      if (!product) continue;

      const shippingPrice = parseInt(product.shippingPrice);
      const freeShippingPrice = parseInt(product.freeShippingPrice);
      const oPrice = shippingPriceObj[product.platformNm]?.price || 0;
      const oShippingPrice =
        shippingPriceObj[product.platformNm]?.shippingPrice || 0;
      const dPrice =
        i === 0
          ? -(parseInt(product.price) + SERVICE_PRICE_PER_PRODUCT)
          : parseInt(product.price) + SERVICE_PRICE_PER_PRODUCT;
      const ePrice = oPrice + dPrice;
      const eShippingPrice = ePrice >= freeShippingPrice ? 0 : shippingPrice;

      shippingSummaryObj[product.platformNm] = {
        freeShippingPrice,
        oPrice,
        oShippingPrice,
        ePrice,
        eShippingPrice,
      };
    }

    return { shippingSummaryObj };
  }, [autoAddFoodForAdd, autoAddFoodForChange, dTOData]);

  return (
    <Box>
      {Object.keys(shippingSummaryObj).map((seller, idx) => (
        <ShippingSummary
          key={idx}
          shippingSummaryObj={shippingSummaryObj}
          seller={seller}
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
