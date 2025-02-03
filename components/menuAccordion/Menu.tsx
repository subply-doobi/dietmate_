// RN, expo
import { useEffect, useState } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { icons } from "@/shared/iconSource";
import { BtnSmall, BtnSmallText, Row, TextMain } from "@/shared/ui/styledComps";
import FoodList from "./FoodList";

// react-query
import { IDietDetailData } from "@/shared/api/types/diet";
import { useDeleteDietDetail } from "@/shared/api/queries/diet";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { usePathname } from "expo-router";

interface IMenu {
  dietNo: string;
  dietDetailData: IDietDetailData;
}

const Menu = ({ dietNo, dietDetailData }: IMenu) => {
  // navigation
  const pathName = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const {
    modalSeq,
    values: {
      productDeleteAlert: { productNoToDelArr },
    },
  } = useAppSelector((state) => state.modal);

  // useState
  const [selectedFoods, setSelectedFoods] = useState<{
    [key: string]: string[];
  }>({});

  // etc
  const isDietEmpty = dietDetailData.length === 0;
  const isCheckedAll =
    !isDietEmpty && selectedFoods[dietNo]?.length === dietDetailData.length;

  // 전체선택 - 삭제 start
  const checkAll = () => {
    const allArr =
      dietDetailData && !isDietEmpty
        ? dietDetailData.map((v) => v.productNo)
        : [];
    dietDetailData && setSelectedFoods({ [dietNo]: allArr });
  };
  const unCheckAll = () => {
    setSelectedFoods({ [dietNo]: [] });
  };

  useEffect(() => {
    const isProductDeleteAlertOpen = modalSeq.includes("productDeleteAlert");
    if (isProductDeleteAlertOpen) {
      return;
    }
    productNoToDelArr?.length === 0 &&
      selectedFoods[dietNo]?.length > 0 &&
      setSelectedFoods({ [dietNo]: [] });
  }, [productNoToDelArr]);

  return (
    <Container>
      {/* 전체선택 - 삭제 */}
      {!isDietEmpty && (
        <SelectedDeleteRow>
          <SelectAllBox>
            <SelectAllCheckbox
              onPress={() => {
                isCheckedAll ? unCheckAll() : checkAll();
              }}
            >
              {isCheckedAll ? (
                <CheckboxImage source={icons.checkboxCheckedGreen_24} />
              ) : (
                <CheckboxImage source={icons.checkbox_24} />
              )}
            </SelectAllCheckbox>

            <SelectAllText>전체 선택</SelectAllText>
          </SelectAllBox>
          <BtnSmall
            onPress={() => {
              selectedFoods[dietNo]?.length >= 1 &&
                dispatch(
                  openModal({
                    name: "productDeleteAlert",
                    values: { productNoToDelArr: selectedFoods[dietNo] },
                  })
                );
              setSelectedFoods({ [dietNo]: [] });
            }}
          >
            <BtnSmallText isActivated={true}>선택 삭제</BtnSmallText>
          </BtnSmall>
        </SelectedDeleteRow>
      )}

      {/* 현재 끼니 식품들 */}
      {!isDietEmpty && (
        <FoodList
          selectedFoods={selectedFoods}
          setSelectedFoods={setSelectedFoods}
          dietNo={dietNo}
        />
      )}
    </Container>
  );
};

export default Menu;

const Container = styled.View``;

const SelectedDeleteRow = styled(Row)`
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 24px;
`;

const SelectAllBox = styled(Row)``;

const SelectAllCheckbox = styled.TouchableOpacity``;

const CheckboxImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const SelectAllText = styled(TextMain)`
  margin-left: 10px;
  font-size: 14px;
  line-height: 18px;
`;
