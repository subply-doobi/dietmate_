import { useEffect } from "react";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";
import { SCREENWIDTH } from "@/shared/constants";
import { useListCategory } from "@/shared/api/queries/category";
import { icons } from "@/shared/iconSource";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setSelectedCategory } from "@/features/reduxSlices/autoMenuSlice";

const Category = () => {
  // redux
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector(
    (state) => state.autoMenu.selectedCategory
  );

  // react-query
  const { data: categoryData } = useListCategory();

  // useEffect
  useEffect(() => {
    categoryData &&
      dispatch(
        setSelectedCategory(
          Array.from({ length: categoryData?.length }, () => true)
        )
      );
  }, [categoryData]);
  return (
    <CategoryBox>
      {categoryData?.map((btn, idx) => (
        <CheckboxBtn
          key={btn.categoryCd}
          onPress={() => {
            const modV = [...selectedCategory];
            modV[idx] = modV[idx] ? false : true;
            dispatch(setSelectedCategory(modV));
          }}
        >
          {selectedCategory[idx] ? (
            <CheckboxImage source={icons.checkboxCheckedGreen_24} />
          ) : (
            <CheckboxImage source={icons.checkbox_24} />
          )}
          <CategoryText>{btn.categoryCdNm}</CategoryText>
        </CheckboxBtn>
      ))}
    </CategoryBox>
  );
};

export default Category;

const CategoryBox = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 64px;
`;

const CheckboxBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  width: ${(SCREENWIDTH - 32) / 3}px;
  margin-bottom: 20px;
`;

const CheckboxImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const CategoryText = styled(TextMain)`
  margin-left: 10px;
  font-size: 14px;
`;
