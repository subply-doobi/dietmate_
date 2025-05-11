import { setCurrentFMCIdx } from "@/features/reduxSlices/commonSlice";
import {
  useCreateDietCnt,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import colors from "@/shared/colors";
import { MENU_NUM_LABEL } from "@/shared/constants";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import CtaButton from "@/shared/ui/CtaButton";
import { Icon, Row, TextMain } from "@/shared/ui/styledComps";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { SetStateAction, useEffect, useState } from "react";
import ScrollPicker from "react-native-wheel-scrollview-picker";
import styled from "styled-components/native";

const PICKER_DATA_ARR = [...MENU_NUM_LABEL];

const checkEveryMenuEmpty = (dTOData: IDietTotalObjData) => {
  const dietNoArr = Object.keys(dTOData);
  const menuLengthList = dietNoArr.map(
    (dietNo) => dTOData[dietNo].dietDetail.length
  );
  if (menuLengthList.every((m: number) => m === 0)) {
    return true;
  }
  return false;
};

const SelectNumOfMenu = ({
  setProgress,
}: {
  setProgress: React.Dispatch<SetStateAction<string[] | IFormulaPageNm[]>>;
}) => {
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
      setProgress(["SelectMethod"]);
      return;
    }

    setProgress(["Formula"]);
  }, [dTOData]);

  // etc
  const createMenu = async (numOfMenu: number) => {
    await createDietCntMutation.mutateAsync({
      dietCnt: String(numOfMenu),
    });
    setProgress(["SelectMethod"]);
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
