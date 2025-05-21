// react, RN, 3rd
import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import styled from "styled-components/native";
import Accordion from "react-native-collapsible/Accordion";

// doobi util, constant etc
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import { NUTRIENT_PROGRESS_HEIGHT, SCREENHEIGHT } from "@/shared/constants";
import { HorizontalSpace, Icon, Row, TextMain } from "@/shared/ui/styledComps";

// doobi Components
import DAlert from "@/shared/ui/DAlert";
import MenuSelectCard from "./MenuSelectCard";
import DeleteAlertContent from "../../modal/alert/DeleteAlertContent";
import NutrientsProgress from "../nutrient/NutrientsProgress";
import DBottomSheet from "../bottomsheet/DBottomSheet";
import MenuNumSelectContent from "@/components/common/cart/MenuNumSelectContent";
import Menu from "@/components/menuAccordion/Menu";

// react-query
import {
  useCreateDiet,
  useDeleteDiet,
  useListDietTotalObj,
} from "@/shared/api/queries/diet";
import MenuNumSelect from "../cart/MenuNumSelect";
import { commaToNum, sumUpPrice } from "@/shared/utils/sumUp";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

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
  const dietDetailData = dTOData?.[currentDietNo]?.dietDetail ?? [];
  // state
  const [activeSection, setActiveSection] = useState<number[]>([]); // accordion
  const [isCreating, setIsCreating] = useState(false);

  // etc
  const isAccordionActive = activeSection.length > 0;
  const priceSum = sumUpPrice(dietDetailData);
  const currentQty =
    dietDetailData && dietDetailData.length > 0
      ? parseInt(dietDetailData[0].qty)
      : 0;
  const hasNoDiet =
    !dTOData || Object.keys(dTOData).length === 0 ? true : false;

  const onMenuNoSelectPress = () => {
    dispatch(
      openModal({
        name: "menuNumSelectBS",
        values: { dietNoToNumControl: currentDietNo },
      })
    );
  };

  // accordion
  // accordionUpdate
  const updateSections = (activeSections: number[]) => {
    setActiveSection(activeSections);
  };

  // useEffect
  // diet생성이나 diet전환할 때 dietNo바뀐경우 activeSection 초기화
  useEffect(() => {
    setActiveSection([]);
  }, [currentDietNo]);

  // accordionContent
  const PROGRESS_ACCORDION = useMemo(() => {
    // 로딩 중
    if (
      getBLIsLoading ||
      isDTOLoading ||
      (baseLineData && Object.keys(baseLineData).length === 0)
    )
      return [
        {
          inactiveHeader: (
            <IndicatorBox>
              <ActivityIndicator size="small" color={colors.main} />
            </IndicatorBox>
          ),
          content: <></>,
          activeHeader: (
            <IndicatorBox>
              <ActivityIndicator size="small" color={colors.main} />
            </IndicatorBox>
          ),
        },
      ];

    // 끼니 없는 경우
    if (hasNoDiet)
      return [
        {
          inactiveHeader: (
            <IndicatorBox
              disabled={isCreating || isDTOFetching}
              onPress={async () => {
                setIsCreating(true);
                await createDietMutation.mutateAsync({
                  setDietNo: true,
                });
                setIsCreating(false);
              }}
            >
              {isCreating || isDTOFetching ? (
                <ActivityIndicator size="small" color={colors.main} />
              ) : (
                <Row>
                  <Icon source={icons.warning_24} size={20} />
                  <AddMenuText>+ 버튼을 눌러 끼니를 추가해보세요</AddMenuText>
                </Row>
              )}
            </IndicatorBox>
          ),
          content: <></>,
          activeHeader: <></>,
        },
      ];

    // 끼니 있는 경우
    return [
      {
        // progressBar
        inactiveHeader: (
          <ProgressContainer>
            {/* 끼니 수량조절 */}
            {isAccordionActive && (
              <>
                <Row
                  style={{
                    marginTop: 24,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <PriceSum>{commaToNum(priceSum)}원</PriceSum>
                  <MenuNumSelect
                    disabled={!!dietDetailData && dietDetailData.length === 0}
                    action="openModal"
                    currentQty={currentQty}
                    openMenuNumSelect={onMenuNoSelectPress}
                  />
                </Row>
                <HorizontalSpace height={8} />
              </>
            )}

            {dietDetailData && (
              <NutrientsProgress dietDetailData={dietDetailData} />
            )}
            {!isAccordionActive && <Arrow source={icons.arrowDown_20} />}
          </ProgressContainer>
        ),
        content: (
          // 툴팁잘림 => activeHeader paddingBottom에 + , content marginTop에 - 로 조절
          <ProgressContainer style={{ marginTop: -24 }}>
            {dietDetailData?.length === 0 ? (
              <>
                <HorizontalSpace height={8} />
                <Menu dietNo={currentDietNo} dietDetailData={dietDetailData} />
              </>
            ) : (
              <ScrollView
                style={{ height: SCREENHEIGHT - 410 }}
                showsVerticalScrollIndicator={false}
              >
                <HorizontalSpace height={8} />
                <Menu
                  dietNo={currentDietNo}
                  dietDetailData={dietDetailData || []}
                />
              </ScrollView>
            )}

            <MenuContainerClose onPress={() => setActiveSection([])}>
              {isAccordionActive && <Arrow source={icons.arrowUp_20} />}
            </MenuContainerClose>
          </ProgressContainer>
        ),
        activeHeader: (
          // 툴팁잘림 => activeHeader paddingBottom에 + , content marginTop에 - 로 조절
          <ProgressContainer style={{ paddingBottom: 24 }}>
            {/* 끼니 수량조절 */}
            <>
              <Row
                style={{
                  marginTop: 24,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <PriceSum>{commaToNum(priceSum)}원</PriceSum>
                <MenuNumSelect
                  disabled={!!dietDetailData && dietDetailData.length === 0}
                  action="openModal"
                  currentQty={currentQty}
                  openMenuNumSelect={onMenuNoSelectPress}
                />
              </Row>
              <HorizontalSpace height={8} />
            </>

            <NutrientsProgress dietDetailData={dietDetailData || []} />
            {!isAccordionActive && <Arrow source={icons.arrowDown_20} />}
          </ProgressContainer>
        ),
      },
    ];
  }, [dTOData, baseLineData, activeSection, isCreating, isDTOFetching]);

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

      <Accordion
        activeSections={activeSection}
        sections={PROGRESS_ACCORDION}
        touchableComponent={TouchableWithoutFeedback}
        renderHeader={(section, _, isActive) =>
          isActive ? section.activeHeader : section.inactiveHeader
        }
        renderContent={(section) => section.content}
        onChange={updateSections}
      />
    </Container>
  );
};

export default MenuSection;

const AddMenuText = styled(TextMain)`
  font-size: 16px;
  margin-left: 4px;
`;

const IndicatorBox = styled.TouchableOpacity`
  width: 100%;
  height: ${NUTRIENT_PROGRESS_HEIGHT}px;
  background-color: ${colors.white};

  justify-content: center;
  align-items: center;
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

const ProgressContainer = styled.View`
  padding: 0px 16px 0px 16px;
  background-color: ${colors.white};
`;

const Arrow = styled.Image`
  width: 20px;
  height: 20px;
  align-self: center;
`;

const PriceSum = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
`;

const MenuContainer = styled.View`
  background-color: ${colors.white};
  padding: 0px 8px 0px 8px;
`;

const MenuContainerClose = styled.TouchableOpacity`
  height: 32px;
  width: 100%;
  align-self: center;

  justify-content: center;
  align-items: center;

  margin-top: 16px;
`;
