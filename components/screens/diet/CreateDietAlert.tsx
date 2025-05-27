// RN
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { HorizontalSpace, TextMain, TextSub } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import MenuNumSelect from "@/components/common/cart/MenuNumSelect";
import { useEffect } from "react";
import { sumUpDietFromDTOData } from "@/shared/utils/sumUp";
import { MENU_LABEL } from "@/shared/constants";

interface ICreateDietAlert {
  numOfCreateDiet: number;
  setNumOfCreateDiet: React.Dispatch<React.SetStateAction<number>>;
  isCreating: boolean;
}
const CreateDietAlert = ({
  numOfCreateDiet,
  setNumOfCreateDiet,
  isCreating,
}: ICreateDietAlert) => {
  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useEffect
  useEffect(() => {
    if (!dTOData) return;
    const { menuNum } = sumUpDietFromDTOData(dTOData);
    menuNum < 5 ? setNumOfCreateDiet(5 - menuNum) : setNumOfCreateDiet(1);
  }, []);

  const NumOfMenu = dTOData ? Object.keys(dTOData).length : 0;
  const desc = `총 다섯 근 공식을 추천해요 \n${
    NumOfMenu !== 0
      ? `(현재 "${MENU_LABEL[NumOfMenu - 1]}"이 공식에 있어요)`
      : ""
  }`;
  if (isCreating)
    return (
      <Container>
        <ActivityIndicator size="small" color={colors.main} />
      </Container>
    );

  return (
    <Container>
      <Title>{"추가할 근 수를\n선택해주세요"}</Title>
      <Desc>{desc}</Desc>
      <HorizontalSpace height={24} />
      <MenuNumSelect
        action="setQty"
        currentQty={numOfCreateDiet}
        setQty={setNumOfCreateDiet}
        maxQty={MENU_LABEL.length - NumOfMenu}
      />
    </Container>
  );
};

export default CreateDietAlert;

const Container = styled.View`
  justify-content: center;
  align-items: center;
  padding: 28px 0px;
`;

const Title = styled(TextMain)`
  font-size: 16px;
  line-height: 24px;
  text-align: center;
`;

const Desc = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  margin-top: 16px;
  text-align: center;
`;
