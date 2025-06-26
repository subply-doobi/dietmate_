import { setBaseListType } from "@/features/reduxSlices/filteredPSlice";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, HorizontalLine, TextMain } from "@/shared/ui/styledComps";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import styled from "styled-components/native";

const BASE_LIST_TYPE = {
  availableFoods: "영양목표 달성 가능한 식품",
  totalFoodList: "전체 식품",
};

const BaseListTypeFilterBSComp = () => {
  // redux
  const dispatch = useAppDispatch();
  const baseListType = useAppSelector(
    (state) => state.filteredProduct.filter.baseListType
  );

  // bottomSheet
  const { dismiss } = useBottomSheetModal();

  const selectBaseListType = (type: "totalFoodList" | "availableFoods") => {
    if (type === baseListType) {
      dismiss();
      return;
    }
    dispatch(setBaseListType(type));
    dismiss();
  };

  return Object.values(BASE_LIST_TYPE).map((type, idx) => (
    <Col key={idx}>
      <Btn
        key={idx}
        onPress={() => {
          selectBaseListType(
            Object.keys(BASE_LIST_TYPE)[idx] as
              | "totalFoodList"
              | "availableFoods"
          );
        }}
      >
        <Text isActive={baseListType === Object.keys(BASE_LIST_TYPE)[idx]}>
          {type}
        </Text>
      </Btn>
      {idx !== Object.values(BASE_LIST_TYPE).length - 1 && <HorizontalLine />}
    </Col>
  ));
};

export default BaseListTypeFilterBSComp;

const Btn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Text = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 20px;
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: center;
`;
