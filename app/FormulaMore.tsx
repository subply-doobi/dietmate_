import SelectBtn from "@/components/screens/formula/SelectBtn";
import {
  setCurrentFMCIdx,
  setFormulaProgress,
} from "@/features/reduxSlices/formulaSlice";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import {
  MAX_MENU_KIND,
  MAX_MENU_NUM,
  MENU_KIND_LABEL,
} from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { ScreenContainer } from "@/shared/ui/styledComps";
import { getDietNum } from "@/shared/utils/dietSummary";
import { getAddDietStatusFrDTData } from "@/shared/utils/getDietAddStatus";
import { useRouter } from "expo-router";
import styled from "styled-components/native";

const FormulaMore = () => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.formula.formulaProgress);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const createDietMutation = useCreateDiet();

  // etc
  const { menuKindNum, menuNum, productNum } = getDietNum(dTOData);
  const menuKindLabel = MENU_KIND_LABEL[menuKindNum - 1];

  const {
    status: addDietStatus,
    text: addBtnText,
    subText: addBtnSubText,
  } = getAddDietStatusFrDTData(dTOData);

  const isAddMenuActive =
    (menuKindNum <= MAX_MENU_KIND - 1 || menuNum <= MAX_MENU_NUM - 1) &&
    addDietStatus === "possible";
  const METHOD_BTN =
    menuKindNum === 0
      ? []
      : [
          {
            text: `자동으로 ${menuKindLabel} 근 공식 만들기`,
            subText: "",
            iconName: "calculator",
            isActive: true,
            onPress: () => {
              router.back();
              dispatch(setFormulaProgress(progress.concat("AMSelect")));
            },
          },
          {
            text: `${menuKindLabel} 근 모두 삭제하기`,
            subText: "",
            iconName: "cancelCircle",
            isActive: true,
            onPress: () => {
              dispatch(openModal({ name: "menuDeleteAllAlert" }));
            },
          },
          {
            text: isAddMenuActive ? "한 가지 근 추가하기" : addBtnText,
            subText: addBtnSubText,
            iconName: "plusCircle",
            isActive: isAddMenuActive,
            onPress: () => {
              createDietMutation.mutate();
              dispatch(setCurrentFMCIdx(menuKindNum));
              router.back();
            },
          },
        ];

  // const activeBtn = METHOD_BTN.filter((item) => item.isActive);

  return (
    <ScreenContainer style={{ paddingHorizontal: 16 }}>
      <BtnBox>
        {METHOD_BTN.map((item, idx) => (
          <SelectBtn
            key={idx}
            text={item.text}
            subText={item.subText}
            iconName={item.iconName}
            disabled={!item.isActive}
            isActive={item.isActive}
            onPress={item.onPress}
          />
        ))}
      </BtnBox>
    </ScreenContainer>
  );
};

export default FormulaMore;

const BtnBox = styled.View`
  width: 100%;
  row-gap: 24px;
`;
