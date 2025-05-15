import { useEffect } from "react";
import styled from "styled-components/native";
import { TextMain } from "@/shared/ui/styledComps";
import { BOTTOM_INDICATOR_IOS, SCREENWIDTH } from "@/shared/constants";
import { useListCategory } from "@/shared/api/queries/category";
import { icons } from "@/shared/iconSource";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setSelectedCategory } from "@/features/reduxSlices/autoMenuSlice";
import { Platform } from "react-native";
import CtaButton from "@/shared/ui/CtaButton";
import { setFormulaProgress } from "@/features/reduxSlices/formulaSlice";

const Category = () => {
  // redux
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector(
    (state) => state.autoMenu.selectedCategory
  );
  const progress = useAppSelector((state) => state.formula.formulaProgress);

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

  // etc
  const isCTAActive =
    selectedCategory && selectedCategory.filter((v) => v).length < 3
      ? false
      : true;
  const insetBottom = Platform.OS === "ios" ? BOTTOM_INDICATOR_IOS : 0;

  return (
    <Container>
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
      <CtaButton
        btnStyle={isCTAActive ? "active" : "inactive"}
        style={{ position: "absolute", bottom: insetBottom + 8 }}
        btnText="다음"
        onPress={() =>
          dispatch(setFormulaProgress(progress.concat("AMCompany")))
        }
      />
    </Container>
  );
};

export default Category;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
`;

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
