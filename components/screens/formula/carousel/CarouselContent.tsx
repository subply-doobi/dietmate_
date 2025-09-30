import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import { useDeleteDiet, useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { FORMULA_CAROUSEL_HEIGHT, MENU_LABEL } from "@/shared/constants";
import {
  Col,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import { useState } from "react";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import styled from "styled-components/native";
import SelectAllRow from "./SelectAllRow";
import CarouselCta from "./CarouselCta";
import CarouselFoodList from "./CarouselFoodList";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import DSmallBtn from "@/shared/ui/DSmallBtn";
import Icon from "@/shared/ui/Icon";
import {
  openBS,
  setLSQtyChange,
} from "@/features/reduxSlices/bottomSheetSlice";

interface ICarouselContent {
  carouselRef: React.RefObject<ICarouselInstance | null>;
  carouselIdx: number;
}

const CarouselContent = ({ carouselRef, carouselIdx }: ICarouselContent) => {
  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const deleteDietMutation = useDeleteDiet();

  // useState
  const [isCheckDelete, setIsCheckDelete] = useState(false);

  // etc
  const carouselDietNo = Object.keys(dTOData || {})[carouselIdx];
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx] || "";
  const carouselMenu = dTOData?.[carouselDietNo]?.dietDetail || [];
  const isCurrent = currentFMCIdx === carouselIdx;
  const currentQty = dTOData?.[carouselDietNo]?.dietDetail?.[0]?.qty || 1;

  const menuDelete = () => {
    const lastMenuIdx = Object.keys(dTOData || {}).length - 1;
    if (lastMenuIdx === 0) {
      deleteDietMutation.mutate({ dietNo: carouselDietNo, currentDietNo });
      return;
    }

    if (lastMenuIdx === carouselIdx) {
      carouselRef.current?.scrollTo({
        index: lastMenuIdx - 1,
        animated: true,
      });
    }
    setTimeout(() => {
      deleteDietMutation.mutate({ dietNo: carouselDietNo, currentDietNo });
    }, 700);
  };

  return (
    <MenuCard>
      <Box>
        {/* 근 삭제 알럿 대체 */}
        {isCheckDelete && (
          <DeleteCheckBox>
            <Col
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DeleteText style={{ fontSize: 16 }}>
                현재 근을 삭제할까요?
              </DeleteText>
            </Col>
            <Row style={{ width: "100%" }}>
              <DeleteConfirmBtn onPress={() => setIsCheckDelete(false)}>
                <DeleteText>취소</DeleteText>
              </DeleteConfirmBtn>
              <DeleteConfirmBtn
                onPress={() => {
                  menuDelete();
                  setIsCheckDelete(false);
                }}
              >
                <DeleteText>삭제</DeleteText>
              </DeleteConfirmBtn>
            </Row>
          </DeleteCheckBox>
        )}

        {/* 상단 타이틀 */}
        <Row
          style={{
            paddingHorizontal: 16,
            justifyContent: "space-between",
            height: 32,
          }}
        >
          <Row style={{ columnGap: 8 }}>
            <Title>{MENU_LABEL[carouselIdx]}</Title>
            {Number(currentQty) > 1 && <SubTitle>( x{currentQty} )</SubTitle>}
          </Row>
          {carouselMenu.length > 0 && (
            <DSmallBtn
              btnText="근수 변경"
              style={{
                borderWidth: 1,
                borderColor: colors.lineLight,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
              }}
              onPress={() => {
                dispatch(setLSQtyChange({ menuIdx: currentFMCIdx }));
                dispatch(
                  openBS({ bsNm: "qtyChange", from: "CarouselContent.tsx" })
                );
              }}
            />
          )}
        </Row>

        {/* 삭제 버튼 */}
        {currentFMCIdx === carouselIdx && !isCheckDelete && (
          <MenuDeleteBtn onPress={() => isCurrent && setIsCheckDelete(true)}>
            <Icon name="cancelCircle" color={colors.textSub} iconSize={16} />
          </MenuDeleteBtn>
        )}

        {/* 상단 progressBar */}
        <Col style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <NutrientsProgress dietDetailData={carouselMenu} />
        </Col>

        {/* 전체선택, 선택삭제 */}
        <SelectAllRow carouselMenu={carouselMenu} />

        {/* 메뉴 리스트 */}
        <CarouselFoodList data={carouselMenu} />

        {/* CTA */}
        <HorizontalSpace height={40} />
        <CarouselCta
          carouselIdx={carouselIdx}
          carouselMenu={carouselMenu}
          carouselDietNo={carouselDietNo}
        />
      </Box>
    </MenuCard>
  );
};

export default CarouselContent;

const MenuCard = styled.View`
  /* height: ${FORMULA_CAROUSEL_HEIGHT + 24}px; */
  margin: 0 32px;
  padding: 24px 0 0 0;
  z-index: 0;
`;

const Box = styled.View`
  width: 100%;
  /* height: ${FORMULA_CAROUSEL_HEIGHT}px; */
  border-radius: 5px;
  padding: 24px 0;
  background-color: ${colors.white};
`;

const Title = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;
const SubTitle = styled(TextSub)`
  font-size: 14px;
  line-height: 18px;
`;

const MenuDeleteBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 100;
  justify-content: center;
  align-items: center;
`;

const DeleteCheckBox = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background-color: ${colors.blackOpacity80};
  align-items: center;
  justify-content: space-between;
`;

const DeleteConfirmBtn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-width: 1px;
  border-color: ${colors.line};
  justify-content: center;
  align-items: center;
`;

const DeleteText = styled(TextMain)`
  color: ${colors.white};
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;
