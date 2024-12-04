import styled from "styled-components/native";
import CommonAlertContent from "@/components/common/alert/CommonAlertContent";
import DTooltip from "@/shared/ui/DTooltip";
import colors from "@/shared/colors";
import { Col, Icon } from "@/shared/ui/styledComps";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import AccordionCtaBtns from "@/components/menuAccordion/AccordionCtaBtns";
import { icons } from "@/shared/iconSource";
import CtaButton from "@/shared/ui/CtaButton";
import { SCREENWIDTH } from "@/shared/constants";
import { ReactElement } from "react";
import { GestureResponderEvent } from "react-native";
import DSmallBtn from "@/shared/ui/DSmallBtn";
import { updateNotShowAgainList } from "@/shared/utils/asyncStorage";
import { setTutorialEnd } from "@/features/reduxSlices/commonSlice";
import { store } from "@/shared/store/reduxStore";
import CreateDietAlert from "@/components/screens/diet/CreateDietAlert";
import LoadingAlertContent from "@/components/screens/diet/LoadingAlertContent";
import AddMenuBtn from "@/components/screens/diet/AddMenuBtn";

interface ICreateDietAlert {
  numOfCreateDiet: number;
  setNumOfCreateDiet: React.Dispatch<React.SetStateAction<number>>;
  isCreating: boolean;
}
interface ICreateDietNA {
  addDietNAText: string;
}

interface IRenderAlertContent {
  createDiet: ({
    numOfCreateDiet,
    setNumOfCreateDiet,
    isCreating,
  }: ICreateDietAlert) => ReactElement;
  createDietNA: ({ addDietNAText }: ICreateDietNA) => ReactElement;
  autoMenuLoading: () => ReactElement;
  autoMenuError: () => ReactElement;
  tutorialComplete: () => ReactElement;
  [key: string]: (args: any) => ReactElement;
}

export const renderAlertContent: IRenderAlertContent = {
  createDiet: ({ numOfCreateDiet, setNumOfCreateDiet, isCreating }) => (
    <CreateDietAlert
      numOfCreateDiet={numOfCreateDiet}
      setNumOfCreateDiet={setNumOfCreateDiet}
      isCreating={isCreating}
    />
  ),
  createDietNA: ({ addDietNAText }) => (
    <CommonAlertContent text={addDietNAText} />
  ),
  autoMenuLoading: () => <LoadingAlertContent />,
  autoMenuError: () => (
    <CommonAlertContent
      text={"자동구성 오류가 발생했어요"}
      subText={"재시도 후에도 오류가 지속되면\n문의 부탁드립니다"}
    />
  ),
  tutorialComplete: () => (
    <CommonAlertContent
      text={"튜토리얼이 완료되었어요\n이제 자유롭게 이용해보세요!"}
      subText={"튜토리얼은 마이페이지에서\n다시 진행할 수 있어요"}
    />
  ),
  noStock: () => (
    <CommonAlertContent
      text={"재고없는 식품이 있어요"}
      subText={"끼니를 확인하고\n식품을 교체해주세요"}
    />
  ),
  autoMenuOverPrice: () => (
    <CommonAlertContent
      text={"앗! 목표영양을 맞추다보니\n예산을 초과했어요"}
      subText={"다시 시도해보셔도 됩니다"}
    />
  ),
};

interface IDTP {
  fn: ((event: GestureResponderEvent) => void) | undefined;
  statusBarHeight: number;
  headerHeight: number;
  bottomTabBarHeight: number;
}
interface IAddMenuDTP extends IDTP {
  dTOData: IDietTotalObjData;
}
interface IAddFoodDTP extends IDTP {
  fn: ((event: GestureResponderEvent) => void) | undefined;
  dTOData: IDietTotalObjData;
  currentDietNo: string;
}
interface IAutoRemainDTP extends IDTP {
  dTOData: IDietTotalObjData;
  currentDietNo: string;
}
interface IAutoMenuDTP extends IDTP {
  dTOData: IDietTotalObjData;
}
interface IRenderDTPContent {
  AddMenu: (p: IAddMenuDTP) => ReactElement;
  AddFood: (p: IAddFoodDTP) => ReactElement;
  AutoRemain: (p: IAutoRemainDTP) => ReactElement;
  ChangeFood: (p: IDTP) => ReactElement;
  AutoMenu: (p: IAutoMenuDTP) => ReactElement;
  [key: string]: (args: any) => ReactElement;
}

export const renderDTPContent: IRenderDTPContent = {
  AddMenu: ({ fn, headerHeight, statusBarHeight, dTOData }) => (
    <>
      <DSmallBtn
        btnText="튜토리얼 건너뛰기"
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          backgroundColor: colors.blackOpacity70,
        }}
        onPress={() => {
          store.dispatch(setTutorialEnd());
          updateNotShowAgainList({ key: "tutorial", value: true });
        }}
      />
      <DTooltip
        tooltipShow={true}
        text="끼니를 먼저 추가해볼까요?"
        boxTop={headerHeight - statusBarHeight}
      />
      <AddMenuBtn
        dTOData={dTOData}
        onPress={fn}
        style={{ marginTop: headerHeight - statusBarHeight + 40 }}
      />
    </>
  ),
  AddFood: ({ headerHeight, statusBarHeight, dTOData, currentDietNo }) => (
    <>
      <DSmallBtn
        btnText="튜토리얼 건너뛰기"
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          backgroundColor: colors.blackOpacity70,
        }}
        onPress={() => {
          store.dispatch(setTutorialEnd());
          updateNotShowAgainList({ key: "tutorial", value: true });
        }}
      />
      <DTooltip
        tooltipShow={true}
        text="식품을 추가할 차례에요!"
        boxTop={headerHeight - statusBarHeight + 40 + 48 + 8 + 70}
        boxLeft={8}
      />
      <AccordionCtaBtns
        style={{
          paddingHorizontal: 8,
          marginTop: headerHeight - statusBarHeight + 40 + 48 + 8 + 70 + 40,
        }}
        dDData={dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []}
        dietNo={currentDietNo}
        onlyAdd={true}
      />
    </>
  ),
  AutoRemain: ({ dTOData, currentDietNo, headerHeight, statusBarHeight }) => (
    <>
      <DSmallBtn
        btnText="튜토리얼 건너뛰기"
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          backgroundColor: colors.blackOpacity70,
        }}
        onPress={() => {
          store.dispatch(setTutorialEnd());
          updateNotShowAgainList({ key: "tutorial", value: true });
        }}
      />
      <Col
        style={{
          position: "absolute",
          width: "100%",
          backgroundColor: colors.white,
          paddingHorizontal: 8,
          marginTop: headerHeight - statusBarHeight + 40 + 48 + 8,
        }}
      >
        <NutrientsProgress
          dietDetailData={dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []}
        />
      </Col>
      <DTooltip
        tooltipShow={true}
        text="남은 영양을 자동으로 채워볼게요!"
        boxTop={
          headerHeight -
          statusBarHeight +
          40 +
          48 +
          8 +
          70 +
          24 +
          32 +
          24 +
          104 +
          1
        }
        boxLeft={8 + 48 + 8}
      />
      <AccordionCtaBtns
        style={{
          paddingHorizontal: 8,
          marginTop:
            headerHeight -
            statusBarHeight +
            40 +
            48 +
            8 +
            70 +
            24 +
            32 +
            24 +
            104 +
            41,
        }}
        dDData={dTOData?.[Object.keys(dTOData)[0]]?.dietDetail ?? []}
        dietNo={currentDietNo}
        onlyAuto={true}
      />
    </>
  ),
  ChangeFood: ({ fn, headerHeight, statusBarHeight }) => (
    <>
      <DSmallBtn
        btnText="튜토리얼 건너뛰기"
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          backgroundColor: colors.blackOpacity70,
        }}
        onPress={() => {
          store.dispatch(setTutorialEnd());
          updateNotShowAgainList({ key: "tutorial", value: true });
        }}
      />
      <DTooltip
        tooltipShow={true}
        triangleRight={16}
        text="영양이 비슷한 식품으로 교체할 수 있어요"
        boxTop={
          headerHeight -
          statusBarHeight +
          40 +
          48 +
          8 +
          70 +
          24 +
          32 +
          24 +
          104 +
          24 +
          104 -
          52 -
          40
        }
        boxRight={8}
      />
      <ChangeBtn
        onPress={fn}
        style={{
          position: "absolute",
          top:
            headerHeight -
            statusBarHeight +
            40 +
            48 +
            8 +
            70 +
            24 +
            32 +
            24 +
            104 +
            24 +
            104 -
            52,
          right: 8,
        }}
      >
        <Icon source={icons.changeRound_24} />
      </ChangeBtn>
    </>
  ),
  AutoMenu: ({ fn, bottomTabBarHeight, dTOData }) => (
    <>
      <DSmallBtn
        btnText="튜토리얼 건너뛰기"
        style={{
          position: "absolute",
          bottom: 40,
          right: 0,
          backgroundColor: colors.blackOpacity70,
        }}
        onPress={() => {
          store.dispatch(setTutorialEnd());
          updateNotShowAgainList({ key: "tutorial", value: true });
        }}
      />
      <DTooltip
        tooltipShow={true}
        text="전체 자동구성도 해볼게요"
        boxBottom={bottomTabBarHeight + 8 + 52 + 24 + 48 + 4}
        boxLeft={0}
      />
      <CtaButton
        shadow={false}
        btnStyle="active"
        style={{
          position: "absolute",
          width: SCREENWIDTH - 32,
          height: 48,
          bottom: bottomTabBarHeight + 8 + 52 + 24,
          alignSelf: "center",
        }}
        btnText={`전체 자동구성`}
        onPress={fn}
      />
    </>
  ),
};

const ChangeBtn = styled.TouchableOpacity`
  width: 32px;
  height: 52px;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-width: 1px;
  border-color: ${colors.lineLight};
`;
