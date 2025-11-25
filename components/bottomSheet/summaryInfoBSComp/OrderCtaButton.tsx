import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import { getNutrStatus, sumUpNutrients } from "@/shared/utils/sumUp";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import * as Progress from "react-native-progress";
import { useRouter } from "expo-router";

const OrderCtaButton = () => {
  // navigation
  const router = useRouter();

  // react-query
  const { data: bLData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);

  // useMemo - calculate calorie-based progress (satisfied/exceed = target)
  const { progressRatio, progressColor, successCount, menuCount, calorieSum } =
    useMemo(() => {
      if (!bLData || !dTOData) {
        return {
          progressRatio: 0,
          progressColor: colors.line,
          successCount: 0,
          menuCount: 0,
          calorieSum: 0,
        };
      }

      const menus = Object.values(dTOData);
      const menuCount = menus.length;
      const targetPerMenu = Number(bLData.calorie || 0);
      const targetTotal = targetPerMenu * menuCount;

      let calorieSum = 0;
      let successCount = 0;

      menus.forEach((item) => {
        const status = getNutrStatus({
          bLData,
          dDData: item.dietDetail,
          totalFoodList,
        });

        if (status === "satisfied" || status === "exceed") {
          // Satisfied or exceed: count as target
          calorieSum += targetPerMenu;
          if (status === "satisfied") successCount += 1;
        } else {
          // Otherwise: use actual calories
          const { cal } = sumUpNutrients(item.dietDetail);
          calorieSum += cal;
        }
      });

      const ratio = targetTotal > 0 ? Math.min(calorieSum / targetTotal, 1) : 0;

      // Color: success if all satisfied, else main
      const progressColor =
        successCount === menuCount ? colors.main : colors.mainDark;

      return {
        progressRatio: ratio,
        progressColor,
        successCount,
        menuCount,
        calorieSum,
      };
    }, [bLData, dTOData, totalFoodList]);

  return (
    <ButtonContainer
      onPress={() => router.push("/Order")}
      activeOpacity={0.8}
      disabled={calorieSum === 0}
    >
      {/* Progress Bar Background */}
      <Progress.Bar
        progress={progressRatio}
        height={48}
        width={null}
        color={progressColor}
        borderColor={colors.line}
        borderWidth={0.5}
        borderRadius={2}
        useNativeDriver={true}
      />

      {/* Button Content */}
      <ButtonContent>
        <ButtonText
          style={{ color: calorieSum === 0 ? colors.textSub : colors.white }}
        >
          {calorieSum === 0 ? "식품을 담아보세요" : "공식 계산하기"}
        </ButtonText>
        <SatisfiedText>
          {successCount} / {menuCount} 가지 근 완료
        </SatisfiedText>
      </ButtonContent>
    </ButtonContainer>
  );
};

export default OrderCtaButton;

const ButtonContainer = styled(TouchableOpacity)`
  width: 100%;
  height: 48px;
`;

const ButtonContent = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  z-index: 1;
`;

const ButtonText = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.white};
`;

const SatisfiedText = styled(TextSub)`
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  font-weight: 100;
  line-height: 14px;
  color: ${colors.white};
`;
