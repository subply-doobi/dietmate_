import { IDietDetailData } from "@/shared/api/types/diet";
import { icons } from "@/shared/iconSource";
import { HorizontalSpace, Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import styled from "styled-components/native";

interface ISelectAllRow {
  selectedFoods: string[];
  setSelectedFoods: React.Dispatch<React.SetStateAction<string[]>>;
  carouselMenu: IDietDetailData;
}
const SelectAllRow = ({
  selectedFoods,
  setSelectedFoods,
  carouselMenu,
}: ISelectAllRow) => {
  const isMenuEmpty = carouselMenu.length === 0;
  const isCheckedAll =
    !isMenuEmpty && selectedFoods.length === carouselMenu.length;

  // 전체선택 - 삭제 start
  const checkAll = () => {
    const allArr = !isMenuEmpty ? carouselMenu.map((v) => v.productNo) : [];
    carouselMenu && setSelectedFoods(allArr);
  };
  const unCheckAll = () => setSelectedFoods([]);

  // if (isMenuEmpty) return null;

  return (
    <SelectedDeleteRow>
      <SelectAllBox
        onPress={() => {
          isCheckedAll ? unCheckAll() : checkAll();
        }}
      >
        <SelectAllCheckbox>
          {isCheckedAll ? (
            <Icon source={icons.checkboxCheckedGreen_24} />
          ) : (
            <Icon source={icons.checkbox_24} />
          )}
        </SelectAllCheckbox>

        <SelectAllText>전체 선택</SelectAllText>
      </SelectAllBox>
      <Price>{commaToNum(sumUpPrice(carouselMenu))}원</Price>
    </SelectedDeleteRow>
  );
};

export default SelectAllRow;

const SelectedDeleteRow = styled(Row)`
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 24px;
  padding: 0 16px;
  width: 100%;
`;

const SelectAllBox = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const SelectAllCheckbox = styled.View``;

const SelectAllText = styled(TextMain)`
  margin-left: 4px;
  font-size: 14px;
  line-height: 18px;
`;

const Price = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  margin-right: 2px;
`;
