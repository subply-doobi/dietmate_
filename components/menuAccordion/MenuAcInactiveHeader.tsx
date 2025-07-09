// RN, expo
import { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { IBaseLineData } from "@/shared/api/types/baseLine";
import { IDietTotalObjData } from "@/shared/api/types/diet";
import DTooltip from "@/shared/ui/DTooltip";
import { Col, Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";

import { useListDietTotalObj } from "@/shared/api/queries/diet";

import { commaToNum, getNutrStatus, sumUpPrice } from "@/shared/utils/sumUp";
import { checkNoStockP } from "@/shared/utils/productStatusCheck";

import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { ENV, MENU_LABEL } from "@/shared/constants";
import { setCurrentFMCIdx } from "@/features/reduxSlices/formulaSlice";
import { useRouter } from "expo-router";

interface IMenuAcInactiveHeader {
  controllable?: boolean;
  dietNo: string;
  bLData: IBaseLineData;
  selected?: boolean;
  leftBarInactive?: boolean;
}
const MenuAcInactiveHeader = ({
  controllable = true,
  dietNo,
  bLData,
  selected = false,
  leftBarInactive,
}: IMenuAcInactiveHeader) => {
  // navigation
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const totalFoodList = useAppSelector((state) => state.common.totalFoodList);
  const foodneededArr = useAppSelector((state) => state.common.foodNeededArr);
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // useState
  const [prevDTO, setPrevDTO] = useState<IDietTotalObjData>({});

  // react-query
  const { data: dTOData, isFetching: isDTOFetching } = useListDietTotalObj();
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";
  // useMemo
  const {
    dDData,
    isFoodNeeded,
    idx,
    priceText,
    currentQty,
    hasNoStockP,
    changedDietNo,
  } = useMemo(() => {
    const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
    const idx =
      Object.keys(dTOData || {}).findIndex((key) => key === dietNo) || 0;
    const priceSum = sumUpPrice(dDData);
    const priceText = `${commaToNum(priceSum)}원`;
    const nutrStatus = getNutrStatus({
      totalFoodList,
      bLData,
      dDData,
    });
    console.log(idx, nutrStatus);
    const isFoodNeeded = nutrStatus === "empty" || nutrStatus === "notEnough";
    const currentQty = dDData.length > 0 ? parseInt(dDData[0].qty, 10) : 1;

    // 재고없는 상품 확인
    const hasNoStockP = checkNoStockP(dTOData, dietNo);
    if (!dTOData)
      return {
        dDData,
        isFoodNeeded,
        hasNoStockP,
        changedDietNo: [],
        idx,
        priceText,
        currentQty,
      };
    Object.keys(prevDTO).length === 0 && setPrevDTO(dTOData);
    // 자동구성으로 어떤 끼니가 바뀌었는지 확인
    const changedDietNo = Object.keys(dTOData).filter((dietNo) => {
      const prevDTOLength = prevDTO[dietNo]?.dietDetail?.length || 0;
      const currentDTOLength = dTOData[dietNo]?.dietDetail?.length;
      const hasSamePNum = prevDTOLength === currentDTOLength;
      if (!hasSamePNum) return true;
      const prevProductArr = prevDTO[dietNo]?.dietDetail?.map(
        (p) => p.productNo
      );
      const hasSameP = dTOData[dietNo]?.dietDetail?.every((p) =>
        prevProductArr?.includes(p.productNo)
      );
      if (!hasSameP) return true;
      return false;
    });
    changedDietNo.length > 0 && setPrevDTO(dTOData);

    return {
      dDData,
      hasNoStockP,
      isFoodNeeded,
      changedDietNo,
      idx,
      priceText,
      currentQty,
    };
  }, [dTOData]);

  // etc
  const neededTooltipShow = foodneededArr.findIndex((v) => v) === idx;

  const barColor = selected
    ? colors.main
    : leftBarInactive
    ? colors.inactive
    : currentDietNo === dietNo
    ? colors.dark
    : colors.inactive;

  return (
    <Box>
      <LeftBar style={{ backgroundColor: barColor }} />
      <Col
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Row
          style={{
            alignItems: "flex-end",
            columnGap: 12,
            marginLeft: 2,
          }}
        >
          <Title>{MENU_LABEL[idx]}</Title>
          {currentQty > 1 && <SubTitle>( x {currentQty} )</SubTitle>}
        </Row>

        <Row
          style={{
            flex: 1,
            alignItems: "flex-end",
            columnGap: 16,
            marginTop: 8,
          }}
        >
          <DTooltip
            tooltipShow={hasNoStockP}
            text="재고없는 상품이 있어요 눌러서 교체해주세요"
            boxTop={-36}
          />
          <ThumnailBox>
            {isDTOFetching && changedDietNo.includes(dietNo) ? (
              <ActivityIndicator
                size={"small"}
                color={colors.dark}
                style={{ flex: 1, alignSelf: "center" }}
              />
            ) : (
              dDData.map((p) => (
                <Thumbnail
                  key={p.productNo}
                  source={{
                    uri: `${ENV.BASE_URL}${p.mainAttUrl}`,
                  }}
                />
              ))
            )}
            {isFoodNeeded && (
              <PlusBtn
                onPress={() => {
                  dispatch(setCurrentFMCIdx(idx));
                  router.push({ pathname: "/(tabs)/Formula" });
                }}
              >
                <Icon source={icons.plusGrey_24} size={16} />
              </PlusBtn>
            )}
          </ThumnailBox>
          {neededTooltipShow && (
            <DTooltip
              tooltipShow={true}
              text="식품이 더 필요해요"
              color={colors.green}
              boxTop={-16}
              boxLeft={dDData.length * 40 + 24}
            />
          )}
          <SubTitle>{priceText}</SubTitle>
        </Row>
      </Col>

      {controllable && (
        <EditBtn
          onPress={() => {
            dispatch(setCurrentFMCIdx(idx));
            router.push({ pathname: "/(tabs)/Formula" });
          }}
        >
          <Icon source={icons.edit_24} />
        </EditBtn>
      )}
      {hasNoStockP && <OpacityBox />}
    </Box>
  );
};

export default MenuAcInactiveHeader;

const Box = styled.View`
  background-color: ${colors.white};
  width: 100%;
  height: 128px;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${colors.inactive};
`;

const OpacityBox = styled.View`
  position: absolute;

  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 5px;
  z-index: 1;
  background-color: ${colors.blackOpacity70};
`;

const LeftBar = styled.View`
  left: 0;
  width: 4px;
  height: 100%;
  background-color: ${colors.inactive};
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const Title = styled(TextMain)`
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
`;

const SubTitle = styled(TextSub)`
  font-size: 14px;
  line-height: 18px;
`;

const EditBtn = styled.TouchableOpacity`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;

  z-index: 2;
`;

const ThumnailBox = styled.View`
  flex: 1;
  height: 56px;
  background-color: ${colors.backgroundLight};
  border-width: 1px;
  border-color: ${colors.lineLight};
  border-radius: 5px;

  flex-direction: row;
  align-items: center;
  overflow: hidden;

  padding: 0 8px;
  column-gap: 4px;

  z-index: 2;
`;

const Thumbnail = styled.Image`
  width: 40px;
  height: 40px;
  background-color: ${colors.backgroundLight2};
  border-radius: 4px;
`;

const PlusBtn = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  background-color: ${colors.backgroundLight2};
  border-radius: 4px;
  border-width: 1px;
  border-color: ${colors.lineLight};

  justify-content: center;
  align-items: center;
`;
