import BottomSheet, {
  useBottomSheet,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import CategoryFilter from "../../screens/search/CategoryFilter";
import styled from "styled-components/native";
import {
  Col,
  HorizontalLine,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { categoryCode } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { setCategory } from "@/features/reduxSlices/filteredPSlice";

const CategoryFilterBSComp = () => {
  // redux
  const dispatch = useAppDispatch();
  const category = useAppSelector(
    (state) => state.filteredProduct.filter.category
  );

  const categoryArr = Object.keys(categoryCode);

  // bottomSheet
  const { dismiss, dismissAll } = useBottomSheetModal();

  // fn
  const selectCategory = (
    c: "" | "CG001" | "CG002" | "CG003" | "CG004" | "CG005" | "CG006"
  ) => {
    if (c === category) {
      dismiss();
      return;
    }
    dispatch(setCategory(c));
    dismiss();
  };

  return (
    <Col>
      {categoryArr.map((c, idx) => (
        <Col key={c}>
          <CategoryBtn
            onPress={() => {
              selectCategory(categoryCode[c]);
            }}
          >
            <CategoryText isActive={category === categoryCode[c]}>
              {c}
            </CategoryText>
            {/* <CategoryNum>({category.productCnt})</CategoryNum> */}
          </CategoryBtn>
          {idx !== categoryArr.length - 1 && <HorizontalLine />}
        </Col>
      ))}
    </Col>
  );
};

export default CategoryFilterBSComp;

const CategoryBtn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const CategoryText = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 20px;
  font-weight: ${({ isActive }) => (isActive ? "700" : "400")};
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: center;
`;
