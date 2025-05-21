// RN, expo
import { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import { IBaseLineData } from "@/shared/api/types/baseLine";
import { IDietTotalObjData } from "@/shared/api/types/diet";

import DAlert from "@/shared/ui/DAlert";
import CommonAlertContent from "@/components/modal/alert/CommonAlertContent";
import DTooltip from "@/shared/ui/DTooltip";
import { Col, Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";

import { useDeleteDiet, useListDietTotalObj } from "@/shared/api/queries/diet";

import { commaToNum, getNutrStatus, sumUpPrice } from "@/shared/utils/sumUp";
import { checkNoStockP } from "@/shared/utils/productStatusCheck";
import { closeModal, openModal } from "@/features/reduxSlices/modalSlice";

import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import MenuNumSelect from "../common/cart/MenuNumSelect";
import { ENV, MENU_NUM_LABEL } from "@/shared/constants";

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
  // redux
  const dispatch = useAppDispatch();
  const { totalFoodList, currentDietNo } = useAppSelector(
    (state) => state.common
  );

  // useState
  const [prevDTO, setPrevDTO] = useState<IDietTotalObjData>({});

  // react-query
  const { data: dTOData, isFetching: isDTOFetching } = useListDietTotalObj();
  const dDData = dTOData?.[dietNo]?.dietDetail ?? [];
  const idx =
    Object.keys(dTOData || {}).findIndex((key) => key === dietNo) || 0;

  // fn
  const onMenuNoSelectPress = () => {
    if (!dTOData) return;
    dispatch(
      openModal({
        name: "menuNumSelectBS",
        values: { dietNoToNumControl: dietNo },
      })
    );
  };

  // etc
  const priceSum = sumUpPrice(dDData);
  const nutrStatus = getNutrStatus({ totalFoodList, bLData, dDData });
  const iconSource =
    nutrStatus === "satisfied"
      ? icons.checkRoundCheckedGreen_24
      : icons.warning_24;
  const priceText = dDData.length !== 0 ? `${commaToNum(priceSum)}원` : "";
  const barColor = selected
    ? colors.main
    : leftBarInactive
    ? colors.inactive
    : currentDietNo === dietNo
    ? colors.dark
    : colors.inactive;
  const thumbnailBorderColor =
    nutrStatus === "satisfied"
      ? colors.success
      : nutrStatus === "exceed"
      ? colors.warning
      : colors.lineLight;
  const currentQty = dDData.length > 0 ? parseInt(dDData[0].qty, 10) : 1;

  const { hasNoStockP, changedDietNo } = useMemo(() => {
    // 재고없는 상품 확인
    const hasNoStockP = checkNoStockP(dTOData, dietNo);
    if (!dTOData) return { hasNoStockP, changedDietNo: [] };
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
      hasNoStockP,
      changedDietNo,
    };
  }, [dTOData]);

  return (
    <Box selected={selected}>
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
          <Title>{MENU_NUM_LABEL[idx]}</Title>
          <SubTitle>{priceText}</SubTitle>
        </Row>

        {dDData.length === 0 ? (
          <SubTitle style={{ marginTop: 4, marginLeft: 2 }}>
            식품을 담아보세요
          </SubTitle>
        ) : (
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
            <ThumnailBox style={{ borderColor: thumbnailBorderColor }}>
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
              {nutrStatus === "exceed" && (
                <Icon
                  size={20}
                  source={iconSource}
                  style={{ position: "absolute", right: 0, top: 0 }}
                />
              )}
            </ThumnailBox>

            {controllable && dDData.length !== 0 && (
              <MenuNumSelect
                disabled={dDData.length === 0}
                action="openModal"
                currentQty={currentQty}
                openMenuNumSelect={onMenuNoSelectPress}
              />
            )}
          </Row>
        )}
      </Col>

      {controllable && (
        <DeleteBtn
          onPress={() =>
            dispatch(
              openModal({
                name: "menuDeleteAlert",
                values: { dietNoToDel: dietNo },
              })
            )
          }
        >
          <Icon source={icons.cancelRound_24} />
        </DeleteBtn>
      )}
      {hasNoStockP && <OpacityBox />}
    </Box>
  );
};

export default MenuAcInactiveHeader;

const Box = styled.View<{
  selected?: boolean;
}>`
  background-color: ${colors.white};
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 5px;
  border-width: 1px;
  border-color: ${({ selected }) => colors.inactive};
  border-width: ${({ selected }) => (selected ? "1px" : "1px")};
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

const DeleteBtn = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  right: 0;
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
