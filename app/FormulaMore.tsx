import SelectBtn from "@/components/screens/formula/SelectBtn";
import {
  setCurrentFMCIdx,
  setFormulaProgress,
} from "@/features/reduxSlices/formulaSlice";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import { MENU_LABEL } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { Container } from "@/shared/ui/styledComps";
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
  const numOfMenu = Object.keys(dTOData || {}).length;
  const numOfMenuLabel = MENU_LABEL[numOfMenu - 1];
  const maxMenuNum = MENU_LABEL.length;

  const {
    status: addDietStatus,
    text: addBtnText,
    subText: addBtnSubText,
  } = getAddDietStatusFrDTData(dTOData);

  const isAddMenuActive =
    numOfMenu <= maxMenuNum - 1 && addDietStatus === "possible";
  const METHOD_BTN =
    numOfMenu === 0
      ? []
      : [
          {
            text: `자동으로 ${numOfMenuLabel} 공식 만들기`,
            subText: "",
            iconName: "calculator",
            isActive: true,
            onPress: () => {
              router.back();
              dispatch(setFormulaProgress(progress.concat("AMSelect")));
            },
          },
          {
            text: `${numOfMenuLabel} 모두 삭제하기`,
            subText: "",
            iconName: "cancelCircle",
            isActive: true,
            onPress: () => {
              dispatch(openModal({ name: "menuDeleteAllAlert" }));
            },
          },
          {
            text: isAddMenuActive ? "한 근 추가하기" : addBtnText,
            subText: addBtnSubText,
            iconName: "plusCircle",
            isActive: isAddMenuActive,
            onPress: () => {
              createDietMutation.mutate({ setDietNo: true });
              dispatch(setCurrentFMCIdx(numOfMenu));
              router.back();
            },
          },
        ];

  // const activeBtn = METHOD_BTN.filter((item) => item.isActive);

  return (
    <Container style={{ paddingHorizontal: 16 }}>
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
    </Container>
  );
};

export default FormulaMore;

const BtnBox = styled.View`
  width: 100%;
  row-gap: 24px;
`;
