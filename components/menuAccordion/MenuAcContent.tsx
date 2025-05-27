import styled from "styled-components/native";
import colors from "@/shared/colors";
import {
  Col,
  HorizontalLine,
  HorizontalSpace,
  Icon,
  TextMain,
} from "@/shared/ui/styledComps";

import {
  commaToNum,
  sumUpDietFromDTOData,
  sumUpPrice,
} from "@/shared/utils/sumUp";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useDispatch } from "react-redux";
import { openModal } from "@/features/reduxSlices/modalSlice";
import MenuNumSelect from "@/components/common/cart/MenuNumSelect";
import FoodList from "./FoodList";
import CtaButton from "@/shared/ui/CtaButton";
import { icons } from "@/shared/iconSource";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { MENU_NUM_LABEL } from "@/shared/constants";

interface IMenuAcContent {
  dietNo: string;
}
const MenuAcContent = ({ dietNo }: IMenuAcContent) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useDispatch();
  const foodNeededArr = useAppSelector((state) => state.common.foodNeededArr);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
  const idx = Object.keys(dTOData ?? {}).indexOf(dietNo);

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
      {foodNeededArr[idx] && (
        <CtaButton
          style={{ marginTop: 24 }}
          btnStyle="border"
          btnText="식품이 더 필요해요"
          btnContent={() => <Icon source={icons.plusRoundSmall_24} size={18} />}
          onPress={() => {
            dispatch(setCurrentFMCIdx(idx));
            router.push({ pathname: "/(tabs)/Formula" });
          }}
        />
      )}
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
