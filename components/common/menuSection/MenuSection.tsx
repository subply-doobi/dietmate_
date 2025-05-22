// react, RN, 3rd
import React from "react";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import styled from "styled-components/native";

// doobi util, constant etc
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import { NUTRIENT_PROGRESS_HEIGHT } from "@/shared/constants";
import { Icon, Row, TextMain } from "@/shared/ui/styledComps";

// doobi Components
import MenuSelectCard from "./MenuSelectCard";
import NutrientsProgress from "../nutrient/NutrientsProgress";

// react-query
import { useCreateDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useRouter } from "expo-router";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";

const MenuSection = () => {
  // redux
  const dispatch = useAppDispatch();
  const { currentDietNo } = useAppSelector((state) => state.common);

  // react-query
  const { data: baseLineData, isLoading: getBLIsLoading } = useGetBaseLine();
  const createDietMutation = useCreateDiet();
  const {
    data: dTOData,
    isLoading: isDTOLoading,
    isFetching: isDTOFetching,
  } = useListDietTotalObj();
  // navigation
  const router = useRouter();

  // state
  const [isCreating, setIsCreating] = useState(false);

  // useMemo
  const { hasNoDiet, dietDetailData, currentDietIdx } = useMemo(() => {
    if (!dTOData)
      return {
        hasNoDiet: true,
        dietDetailData: [],
        currentDietIdx: 0,
      };
    const hasNoDiet =
      !dTOData || Object.keys(dTOData).length === 0 ? true : false;
    const dietDetailData = dTOData?.[currentDietNo]?.dietDetail ?? [];
    const currentDietIdx = Object.keys(dTOData).findIndex(
      (key) => key === currentDietNo
    );
    return {
      hasNoDiet,
      dietDetailData,
      currentDietIdx,
    };
  }, [dTOData]);

  const progressLoading =
    getBLIsLoading ||
    isCreating ||
    (baseLineData && Object.keys(baseLineData).length === 0);

  // fn
  const onProgressPress = async () => {
    if (progressLoading) return;
    if (!hasNoDiet) {
      dispatch(setCurrentFMCIdx(currentDietIdx));
      router.push({ pathname: "/(tabs)/Formula" });
      return;
    }

    setIsCreating(true);
    await createDietMutation.mutateAsync({
      setDietNo: true,
    });
    setIsCreating(false);
  };

  // render
  return (
    <Container>
      {/* 끼니 선택 책갈피 */}
      <HeaderRow>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <MenuSelectCard
            isCreating={isCreating}
            setIsCreating={setIsCreating}
          />
        </ScrollView>
        {!hasNoDiet && (
          <DeleteBtn
            onPress={() => {
              dispatch(
                openModal({
                  name: "menuDeleteAlert",
                  values: { dietNoToDel: currentDietNo },
                })
              );
            }}
          >
            <DeleteImg source={icons.deleteRound_18} />
          </DeleteBtn>
        )}
      </HeaderRow>
      <ProgressContainer disabled={progressLoading} onPress={onProgressPress}>
        {progressLoading && (
          <ActivityIndicator size={"small"} color={colors.main} />
        )}
        {hasNoDiet && !progressLoading && (
          <Row>
            <Icon source={icons.warning_24} size={20} />
            <AddMenuText>+ 버튼을 눌러 끼니를 추가해보세요</AddMenuText>
          </Row>
        )}
        {dietDetailData && !progressLoading && !hasNoDiet && (
          <NutrientsProgress dietDetailData={dietDetailData} />
        )}
      </ProgressContainer>
    </Container>
  );
};

export default MenuSection;

const AddMenuText = styled(TextMain)`
  font-size: 16px;
  margin-left: 4px;
`;

const Container = styled.View`
  background-color: ${colors.backgroundLight2};
  padding: 0px 0px 16px 0px;
  width: 100%;
  z-index: 1000;
`;

const HeaderRow = styled(Row)`
  justify-content: space-between;
  align-items: flex-end;
`;

const DeleteBtn = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
`;

const DeleteImg = styled.Image`
  width: 18px;
  height: 18px;
`;

const ProgressContainer = styled.TouchableOpacity`
  width: 100%;
  height: ${NUTRIENT_PROGRESS_HEIGHT}px;
  padding: 0px 16px 0px 16px;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
`;
