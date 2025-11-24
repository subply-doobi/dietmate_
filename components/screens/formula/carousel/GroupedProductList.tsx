import { ScrollView } from "react-native";
import styled from "styled-components/native";
import SellerSection from "./SellerSection";
import {
  IDietDetailData,
  IDietDetailProductData,
} from "@/shared/api/types/diet";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setProductToDel } from "@/features/reduxSlices/bottomSheetSlice";
import colors from "@/shared/colors";
import { TextSub } from "@/shared/ui/styledComps";

interface IGroupedProductListProps {
  dietDetailData: IDietDetailData;
}

const GroupedProductList = ({ dietDetailData }: IGroupedProductListProps) => {
  const dispatch = useAppDispatch();
  const pToDel = useAppSelector((state) => state.bottomSheet.bsData.pToDel);

  const { regrouped } = regroupDDataBySeller(dietDetailData);
  const sellers = Object.keys(regrouped);

  const onProductPress = (product: IDietDetailProductData) => {
    const isIncluded = pToDel.some((p) => p.productNo === product.productNo);
    const newArr = isIncluded
      ? pToDel.filter((p) => p.productNo !== product.productNo)
      : [...pToDel, product];
    dispatch(setProductToDel(newArr));
  };

  if (dietDetailData.length === 0) {
    return (
      <EmptyBox>
        <EmptyText>근에 담긴 식품이 없어요</EmptyText>
      </EmptyBox>
    );
  }

  return (
    <ScrollContainer
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 40, paddingBottom: 104, rowGap: 40 }}
    >
      {sellers.map((seller) => (
        <SellerSection
          key={seller}
          sellerName={seller}
          products={regrouped[seller]}
          selectedProducts={pToDel}
          onProductPress={onProductPress}
        />
      ))}
    </ScrollContainer>
  );
};

export default GroupedProductList;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
`;

const EmptyBox = styled.View`
  flex: 1;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
  margin: 24px 16px 72px 16px;
  justify-content: center;
  align-items: center;
  min-height: 120px;
`;

const EmptyText = styled(TextSub)`
  font-size: 14px;
  line-height: 20px;
`;
