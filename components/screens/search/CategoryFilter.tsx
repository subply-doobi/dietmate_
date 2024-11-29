// RN, expo
import { ActivityIndicator } from "react-native";

// doobi
import { useListCategoryCnt } from "@/shared/api/queries/category";
import {
  Col,
  HorizontalLine,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";

import styled from "styled-components/native";
import colors from "@/shared/colors";
import { updateCategory } from "@/features/reduxSlices/sortFilterSlice";
import { ICategoryCnt } from "@/shared/api/types/category";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const getTotalCnt = (categoryCntData: ICategoryCnt | undefined) => {
  if (!categoryCntData) return 0;
  return categoryCntData?.reduce(
    (acc, cur) => Number(acc) + Number(cur.productCnt),
    0
  );
};

const CategoryFilter = () => {
  // react-query
  const { data: categoryCntData, isLoading: isCategoryCntDataLoading } =
    useListCategoryCnt();

  // redux
  const dispatch = useAppDispatch();
  const {
    copied: { filter },
  } = useAppSelector((state) => state.sortFilter);

  if (isCategoryCntDataLoading || !categoryCntData)
    return (
      <Col style={{ flex: 1 }}>
        <ActivityIndicator size="large" color={colors.main} />
      </Col>
    );

  return (
    <Col style={{ flex: 1 }}>
      {/* 맨 위 "전체" 버튼 */}
      <CategoryBtn onPress={() => dispatch(updateCategory(""))}>
        <CategoryText isActive={filter.category === ""}>전체</CategoryText>
        <CategoryNum>({getTotalCnt(categoryCntData)})</CategoryNum>
      </CategoryBtn>
      <HorizontalLine />

      {/* 각 카테고리 버튼 */}
      {categoryCntData?.map((category, idx) => (
        <Col key={category.categoryCd}>
          <CategoryBtn
            onPress={() => dispatch(updateCategory(category.categoryCd))}
          >
            <CategoryText isActive={filter.category === category.categoryCd}>
              {category.categoryCdNm}{" "}
            </CategoryText>
            <CategoryNum>({category.productCnt})</CategoryNum>
          </CategoryBtn>
          {idx !== categoryCntData.length - 1 && <HorizontalLine />}
        </Col>
      ))}
    </Col>
  );
};

export default CategoryFilter;

const CategoryBtn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const CategoryText = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: center;
`;

const CategoryNum = styled(TextSub)`
  font-size: 16px;
`;
