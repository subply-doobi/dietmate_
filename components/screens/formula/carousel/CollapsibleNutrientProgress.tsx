import { useState, useMemo } from "react";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import { Row, Col, TextMain, TextSub } from "@/shared/ui/styledComps";
import Icon from "@/shared/ui/Icon";
import * as Progress from "react-native-progress";
import { IDietDetailData } from "@/shared/api/types/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { sumUpNutrients } from "@/shared/utils/sumUp";
import { NUTR_ERROR_RANGE } from "@/shared/constants";

interface ICollapsibleNutrientProgressProps {
  dietDetailData: IDietDetailData;
  initialExpanded?: boolean;
}

const CollapsibleNutrientProgress = ({
  dietDetailData,
  initialExpanded = false,
}: ICollapsibleNutrientProgressProps) => {
  // useState
  const [expanded, setExpanded] = useState(initialExpanded);

  // react-query
  const { data: baseLineData } = useGetBaseLine();

  const nutrients = useMemo(() => {
    const { cal, carb, protein, fat } = sumUpNutrients(dietDetailData);
    const targetCal = parseInt(baseLineData?.calorie || "0", 10) || 0;
    const targetCarb = parseInt(baseLineData?.carb || "0", 10) || 0;
    const targetProtein = parseInt(baseLineData?.protein || "0", 10) || 0;
    const targetFat = parseInt(baseLineData?.fat || "0", 10) || 0;

    const getColor = (value: number, target: number, key: string) => {
      if (!target) return colors.line;
      const errorRange = NUTR_ERROR_RANGE[key as keyof typeof NUTR_ERROR_RANGE];
      if (value > target + errorRange[1]) return colors.warning;
      if (value < target + errorRange[0]) return colors.main;
      return colors.success;
    };

    return [
      {
        label: "칼로리",
        value: cal,
        target: targetCal,
        progress: targetCal ? cal / targetCal : 0,
        color: getColor(cal, targetCal, "calorie"),
      },
      {
        label: "탄수화물",
        value: carb,
        target: targetCarb,
        progress: targetCarb ? carb / targetCarb : 0,
        color: getColor(carb, targetCarb, "carb"),
      },
      {
        label: "단백질",
        value: protein,
        target: targetProtein,
        progress: targetProtein ? protein / targetProtein : 0,
        color: getColor(protein, targetProtein, "protein"),
      },
      {
        label: "지방",
        value: fat,
        target: targetFat,
        progress: targetFat ? fat / targetFat : 0,
        color: getColor(fat, targetFat, "fat"),
      },
    ];
  }, [baseLineData, dietDetailData]);

  return (
    <Container>
      {/* Collapsed: single 24px row with calorie bar + icon */}
      <CollapsedRow onPress={() => setExpanded((p) => !p)}>
        <GraphColumn>
          <Progress.Bar
            progress={nutrients[0].progress}
            width={null}
            height={4}
            color={nutrients[0].color}
            unfilledColor={colors.bgBox}
            borderWidth={0}
            useNativeDriver={true}
          />
          <LabelRow>
            <LabelText>{nutrients[0].label}</LabelText>
            <ValueText>
              {nutrients[0].value} / {nutrients[0].target}
            </ValueText>
          </LabelRow>
        </GraphColumn>
        <IconBtn>
          <Icon
            name={expanded ? "chevronUp" : "more"}
            color={colors.textSub}
            iconSize={expanded ? 16 : 20}
            boxSize={24}
          />
        </IconBtn>
      </CollapsedRow>

      {/* Expanded: absolute positioned overlay showing all 4 nutrients */}
      {expanded && (
        <ExpandedOverlay
          onPress={() => setExpanded(false)}
          style={[{ boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.15)" }]}
        >
          <ExpandedContent>
            {nutrients.slice(1).map((n) => (
              <NutrientLine key={n.label}>
                <Progress.Bar
                  progress={n.progress}
                  width={null}
                  height={4}
                  color={n.color}
                  unfilledColor={colors.bgBox}
                  borderWidth={0}
                  useNativeDriver={true}
                />
                <LabelRow>
                  <LabelText>{n.label}</LabelText>
                  <ValueText>
                    {n.value}/{n.target}
                  </ValueText>
                </LabelRow>
              </NutrientLine>
            ))}
          </ExpandedContent>
        </ExpandedOverlay>
      )}
    </Container>
  );
};

export default CollapsibleNutrientProgress;

const Container = styled.View`
  padding: 0 16px;
  height: 24px;
  z-index: 10;
`;

const CollapsedRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  height: 24px;
  column-gap: 2px;
  margin-right: -8px;
`;

const GraphColumn = styled.View`
  flex: 1;
  row-gap: 2px;
`;

const LabelRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
`;

const LabelText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 200;
`;

const ValueText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  font-weight: 200;
`;

const IconBtn = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
  margin-top: -4px;
`;

const ExpandedOverlay = styled.TouchableOpacity`
  position: absolute;
  top: 28px;
  left: 12px;
  right: 12px;
  background-color: ${colors.white};
  border-radius: 8px;
  padding: 20px 16px 16px 16px;
  z-index: 100;
`;

const ExpandedContent = styled(Col)`
  row-gap: 12px;
`;

const NutrientLine = styled.View`
  row-gap: 2px;
`;
