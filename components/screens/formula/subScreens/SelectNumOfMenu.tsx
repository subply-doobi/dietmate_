import {
  setCurrentFMCIdx,
  setFormulaProgress,
} from "@/features/reduxSlices/formulaSlice";
import {
  useCreateDietCnt,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { MENU_NUM_LABEL } from "@/shared/constants";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import CtaButton from "@/shared/ui/CtaButton";
import { Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { checkEveryMenuEmpty } from "@/shared/utils/sumUp";
import { useEffect, useState } from "react";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import styled from "styled-components/native";

const PICKER_DATA_ARR = [...MENU_NUM_LABEL];

const SelectNumOfMenu = () => {
  // redux
  const dispatch = useAppDispatch();

  // useState
  const [numOfMenu, setNumOfMenu] = useState(5);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const createDietCntMutation = useCreateDietCnt();

  // useEffect
  //
  useEffect(() => {
    if (!dTOData) return;
    const isNoMenu = Object.keys(dTOData).length === 0;
    if (isNoMenu) {
      return;
    }
    const isEveryMenuEmpty = checkEveryMenuEmpty(dTOData);
    if (isEveryMenuEmpty) {
      dispatch(setFormulaProgress(["SelectMethod"]));
      return;
    }
    dispatch(setFormulaProgress(["Formula"]));
  }, [dTOData]);

  // etc
  const createMenu = async (numOfMenu: number) => {
    await createDietCntMutation.mutateAsync({
      dietCnt: String(numOfMenu),
    });
    dispatch(setCurrentFMCIdx(0));
  };

  return (
    <Container>
      <PickerBox>
        <ScrollPicker
          dataSource={PICKER_DATA_ARR}
          selectedIndex={4}
          renderItem={(data, _, isSelected) => (
            <Row>
              <PickerItem isSelected={isSelected}>{data}</PickerItem>
              <Icon source={icons.appIcon} size={isSelected ? 32 : 24} />
              {isSelected || <WhiteOpacityBox />}
            </Row>
          )}
          onValueChange={(data, selectedIndex) =>
            setNumOfMenu(selectedIndex + 1)
          }
          wrapperHeight={80 * 3}
          wrapperBackground={colors.white}
          itemHeight={80}
          highlightColor={colors.lineLight}
          highlightBorderWidth={2}
        />
      </PickerBox>
      <CtaButton
        style={{ position: "absolute", bottom: 8 }}
        btnStyle="active"
        btnText={`${PICKER_DATA_ARR[numOfMenu - 1]}으로 공식 만들기`}
        onPress={() => createMenu(numOfMenu)}
      />
    </Container>
  );
};

export default SelectNumOfMenu;

const Container = styled.View`
  flex: 1;
  padding-left: 16px;
  padding-right: 16px;
  align-items: center;
`;

const PickerItem = styled(TextMain)<{ isSelected: boolean }>`
  font-size: ${({ isSelected }) => (isSelected ? 24 : 18)}px;
  line-height: 32px;
  font-weight: bold;
`;

const PickerBox = styled.View`
  width: 80%;
  height: 240px;
  margin-top: 40px;
`;

const WhiteOpacityBox = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
`;
