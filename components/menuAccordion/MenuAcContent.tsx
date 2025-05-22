import styled from "styled-components/native";
import colors from "@/shared/colors";
import {
  Col,
  HorizontalLine,
  HorizontalSpace,
  TextMain,
} from "@/shared/ui/styledComps";

import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useDispatch } from "react-redux";
import { openModal } from "@/features/reduxSlices/modalSlice";
import MenuNumSelect from "@/components/common/cart/MenuNumSelect";
import FoodList from "./FoodList";

interface IMenuAcContent {
  dietNo: string;
}
const MenuAcContent = ({ dietNo }: IMenuAcContent) => {
  // redux
  const dispatch = useDispatch();

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[dietNo]?.dietDetail ?? [];

  // etc
  const dietPrice = sumUpPrice(dDData);
  const currentQty = dDData[0]?.qty ? parseInt(dDData[0].qty, 10) : 1;
  const isEmpty = dDData.length === 0;

  // fn
  const onMenuNoSelectPress = () => {
    if (isEmpty) return;
    dispatch(
      openModal({
        name: "menuNumSelectBS",
        values: { dietNoToNumControl: dietNo },
      })
    );
  };

  return (
    <Container>
      {/* 식품 리스트 */}
      <FoodList dietNo={dietNo} />
      {/* 수량조절 - 가격 */}
      {dDData.length !== 0 && (
        <Col
          style={{
            marginTop: 24,
            alignItems: "flex-end",
          }}
        >
          <HorizontalLine />
          <HorizontalSpace height={24} />
          <MenuNumSelect
            disabled={isEmpty}
            action="openModal"
            currentQty={currentQty}
            openMenuNumSelect={onMenuNoSelectPress}
          />
          <Price>{commaToNum(dietPrice)}원</Price>
        </Col>
      )}
    </Container>
  );
};

export default MenuAcContent;

const Container = styled.View`
  background-color: ${colors.white};
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-color: ${colors.lineLight};
  border-width: 1px;
  padding: 40px 16px;
`;

const Price = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
`;
