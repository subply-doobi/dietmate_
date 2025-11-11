import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { useMemo } from "react";
import styled from "styled-components/native";
import SellerShippingText from "../../common/summaryInfo/SellerShippingText";
import { StyleProp, ViewStyle } from "react-native";
import { getPlatformSummaries } from "@/shared/utils/dietSummary";

interface IProductSelectShippingInfo {
  containerStyle?: StyleProp<ViewStyle>;
}
const ProductSelectShippingInfo = ({
  containerStyle = {},
}: IProductSelectShippingInfo) => {
  // redux
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const { pToAdd, pToDel } = useAppSelector(
    (state) => state.bottomSheet.bsData
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";

  // useMemo
  const { platformSummary } = useMemo(() => {
    const foodChangeMap = {
      [currentDietNo]: { delete: pToDel[0], add: pToAdd[0] },
    };
    const platformSummary = getPlatformSummaries(
      dTOData,
      undefined,
      foodChangeMap
    );

    return { platformSummary };
  }, [dTOData, pToAdd, pToDel]);

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
          platformSummary={platformSummary.find((p) => p.platformNm === seller)}
          seller={seller}
          mainTextColor={colors.white}
          subTextColor={colors.textSub}
        />
      ))}
    </Box>
  );
};

export default ProductSelectShippingInfo;

const Box = styled.View`
  width: 100%;
  row-gap: 16px;
`;
