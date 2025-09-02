// RN, expo
import { useMemo } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import colors from "@/shared/colors";
import { Col, TextMain, TextSub } from "@/shared/ui/styledComps";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";

const ChangeResult = () => {
  // react-query
  const { data: baseLineData } = useGetBaseLine();

  // userInput state
  const weight = useAppSelector((state) => state.userInput.weight);
  const calorie = useAppSelector((state) => state.userInput.calorie);
  const carb = useAppSelector((state) => state.userInput.carb);
  const protein = useAppSelector((state) => state.userInput.protein);
  const fat = useAppSelector((state) => state.userInput.fat);

  const changeContent = useMemo(() => {
    if (!baseLineData) return [];

    const weightDiff = Math.round(
      parseInt(weight.value) - parseInt(baseLineData.weight)
    );
    const calorieDiff = Math.round(
      parseInt(calorie.value) - parseInt(baseLineData.calorie)
    );
    const carbDiff = Math.round(
      parseInt(carb.value) - parseInt(baseLineData.carb)
    );
    const proteinDiff = Math.round(
      parseInt(protein.value) - parseInt(baseLineData.protein)
    );
    const fatDiff = Math.round(
      parseInt(fat.value) - parseInt(baseLineData.fat)
    );

    return [
      {
        title: "몸무게",
        prev: `${parseInt(baseLineData.weight)}kg`,
        curr: `${parseInt(weight.value)}kg`,
        diff:
          weightDiff < 0
            ? `(${weightDiff})`
            : weightDiff > 0
            ? `(+${weightDiff})`
            : "",
        color: colors.dark,
      },
      {
        title: "칼로리",
        prev: `${parseInt(baseLineData.calorie)}kcal`,
        curr: `${parseInt(calorie.value)}kcal`,
        diff:
          calorieDiff < 0
            ? `(${calorieDiff})`
            : calorieDiff > 0
            ? `(+${calorieDiff})`
            : "",
        color: colors.calorie,
      },
      {
        title: "탄수화물",
        prev: `${parseInt(baseLineData.carb)}g`,
        curr: `${parseInt(carb.value)}g`,
        diff:
          carbDiff < 0 ? `(${carbDiff})` : carbDiff > 0 ? `(+${carbDiff})` : "",
        color: colors.carb,
      },
      {
        title: "단백질",
        prev: `${parseInt(baseLineData.protein)}g`,
        curr: `${parseInt(protein.value)}g`,
        diff:
          proteinDiff < 0
            ? `(${proteinDiff})`
            : proteinDiff > 0
            ? `(+${proteinDiff})`
            : "",
        color: colors.protein,
      },
      {
        title: "지방",
        prev: `${parseInt(baseLineData.fat)}g`,
        curr: `${parseInt(fat.value)}g`,
        diff: fatDiff < 0 ? `(${fatDiff})` : fatDiff > 0 ? `(+${fatDiff})` : "",
        color: colors.fat,
      },
    ];
  }, [baseLineData, weight, calorie, carb, protein, fat]);

  return (
    <Container>
      {changeContent.map((item, idx) => (
        <Box key={item.title}>
          <Bar style={{ backgroundColor: item.color }} />
          <Col style={{ flex: 1.4, marginLeft: 16 }}>
            <PrevValue>{item.title}</PrevValue>
            <PrevValue style={{ marginTop: 2 }}>{item.prev}</PrevValue>
          </Col>
          <Icon name="chevronRight" color={colors.line} iconSize={20} />
          <Col style={{ flex: 1, marginLeft: 16 }}>
            <CurrValue>{item.curr} </CurrValue>
          </Col>
          <Col style={{ flex: 1.2, marginLeft: 16 }}>
            <CurrValue>{item.diff}</CurrValue>
          </Col>
        </Box>
      ))}
    </Container>
  );
};

export default ChangeResult;
const Container = styled.View`
  flex: 1;
  row-gap: 12px;
`;
const Box = styled.View`
  flex-direction: row;
  flex: 1;
  height: 58px;
  align-items: center;
`;

const Bar = styled.View`
  width: 6px;
  height: 58px;
  background-color: ${colors.black};
  position: absolute;
  left: 0;
  border-radius: 2px;
`;

const PrevValue = styled(TextSub)`
  font-size: 16px;
  line-height: 20px;
`;
const CurrValue = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
`;
