// RN, expo
import { useEffect, useState } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { icons } from "@/shared/iconSource";
import { BtnSmall, BtnSmallText, Row, TextMain } from "@/shared/ui/styledComps";
import DAlert from "@/shared/ui/DAlert";
import DeleteAlertContent from "../common/alert/DeleteAlertContent";
import FoodList from "./FoodList";

// react-query
import { IDietDetailData } from "@/shared/api/types/diet";
import { useDeleteDietDetail } from "@/shared/api/queries/diet";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

interface IMenu {
  dietNo: string;
  dietDetailData: IDietDetailData;
}

const Menu = ({ dietNo, dietDetailData }: IMenu) => {
  // redux
  const dispatch = useAppDispatch();
  const productDeleteAlert = useAppSelector(
    (state) => state.modal.modal.productDeleteAlert
  );

  // react-query
  const deleteDietDetailMutation = useDeleteDietDetail();

  // useState
  const [checkAllClicked, setCheckAllClicked] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<{
    [key: string]: string[];
  }>({});

  // etc
  const isDietEmpty = dietDetailData.length === 0;

  useEffect(() => {
    const numOfFoodInCurrentDiet = isDietEmpty ? 0 : dietDetailData.length;
    selectedFoods[dietNo]?.length !== numOfFoodInCurrentDiet
      ? setCheckAllClicked(false)
      : setCheckAllClicked(true);
  }, [selectedFoods, dietDetailData, dietNo]);

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

  const deleteSelected = async () => {
    setCheckAllClicked(false);
    // setDeleteModalShow(false);
    dispatch(closeModal({ name: "productDeleteAlert" }));
    const deleteMutations = selectedFoods[dietNo]?.map((productNo) =>
      deleteDietDetailMutation.mutateAsync({
        dietNo,
        productNo,
      })
    );

    await Promise.all(deleteMutations)
      .then(() => {
        unCheckAll();
      })
      .catch((e) => console.log("삭제 실패", e));
  };

  return (
    <Container>
      {/* 전체선택 - 삭제 */}
      {!isDietEmpty && (
        <SelectedDeleteRow>
          <SelectAllBox>
            <SelectAllCheckbox
              onPress={() => {
                checkAllClicked ? unCheckAll() : checkAll();
                setCheckAllClicked((clicked) => !clicked);
              }}
            >
              {checkAllClicked ? (
                <CheckboxImage source={icons.checkboxCheckedGreen_24} />
              ) : (
                <CheckboxImage source={icons.checkbox_24} />
              )}
            </SelectAllCheckbox>

            <SelectAllText>전체 선택</SelectAllText>
          </SelectAllBox>
          <BtnSmall
            onPress={() =>
              selectedFoods[dietNo]?.length >= 1
                ? dispatch(
                    openModal({
                      name: "productDeleteAlert",
                      modalId: `Menu_${dietNo}`,
                    })
                  )
                : {}
            }
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

      {/* 삭제 알럿 */}
      <DAlert
        alertShow={
          productDeleteAlert.isOpen &&
          productDeleteAlert.modalId === `Menu_${dietNo}`
        }
        NoOfBtn={2}
        confirmLabel="삭제"
        onConfirm={deleteSelected}
        onCancel={() => dispatch(closeModal({ name: "productDeleteAlert" }))}
        renderContent={() => <DeleteAlertContent deleteText="선택된 식품을" />}
      />
    </Container>
  );
};

export default Menu;

const Container = styled.View`
  z-index: -1;
`;

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
