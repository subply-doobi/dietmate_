import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { useMemo } from "react";
import styled from "styled-components/native";
import SellerShippingText from "./SellerShippingText";
import { StyleProp, ViewStyle } from "react-native";

interface IProductSelectShippingInfo {
  containerStyle?: StyleProp<ViewStyle>;
}
const ProductSelectTShippingInfo = ({
  containerStyle = {},
}: IProductSelectShippingInfo) => {
  // redux
  const bsNm = useAppSelector((state) => state.bottomSheet.bsNm);
  const { add: pToAdd, del: pToDel } = useAppSelector(
    (state) => state.bottomSheet.product
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
      [pToAdd[0]?.platformNm, pToDel[0]?.platformNm].filter(Boolean) as string[]
    )
  );

  return (
    <Box style={[containerStyle]}>
      {relevantSellerNmArr.map((seller, idx) => (
        <SellerShippingText
          key={idx}
          shippingPriceObj={shippingPriceObj}
          seller={seller}
          productToAdd={pToAdd[0]}
          productToDel={pToDel[0]}
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
  row-gap: 16px;
`;
