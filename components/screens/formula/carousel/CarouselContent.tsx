import NutrientsProgress from "@/components/common/nutrient/NutrientsProgress";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { FORMULA_CAROUSEL_HEIGHT } from "@/shared/constants";
import { icons } from "@/shared/iconSource";
import {
  Col,
  HorizontalSpace,
  Icon,
  Row,
  TextMain,
} from "@/shared/ui/styledComps";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { useState } from "react";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import styled from "styled-components/native";
import SelectAllRow from "./SelectAllRow";
import CarouselCta from "./CarouselCta";
import CarouselFoodList from "./CarouselFoodList";

interface ICarouselContent {
  setProgress: React.Dispatch<
    React.SetStateAction<string[] | IFormulaPageNm[]>
  >;
  carouselRef: React.RefObject<ICarouselInstance>;
  carouselIdx: number;
}

const CarouselContent = ({
  setProgress,
  carouselRef,
  carouselIdx,
}: ICarouselContent) => {
  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useState
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  // etc
  const carouselDietNo = Object.keys(dTOData || {})[carouselIdx];
  const carouselMenu = dTOData?.[carouselDietNo].dietDetail || [];

  return (
    <MenuCard key={carouselIdx}>
      <Box>
        <MenuDeleteBtn onPress={() => console.log("menuDelete!")}>
          <Icon source={icons.deleteRound_18} size={18} />
        </MenuDeleteBtn>
        {/* 상단 progressBar */}
        <Col style={{ paddingHorizontal: 16 }}>
          <NutrientsProgress dietDetailData={carouselMenu} />
        </Col>

        {/* 전체선택, 선택삭제 */}
        <SelectAllRow
          selectedFoods={selectedFoods}
          setSelectedFoods={setSelectedFoods}
          carouselMenu={carouselMenu}
        />

        {/* 메뉴 리스트 */}
        <CarouselFoodList
          data={carouselMenu}
          carouselIdx={carouselIdx}
          selectedFoods={selectedFoods}
          setSelectedFoods={setSelectedFoods}
        />

        {/* CTA */}
        <HorizontalSpace height={40} />
        <CarouselCta
          selectedFoods={selectedFoods}
          setSelectedFoods={setSelectedFoods}
          carouselMenu={carouselMenu}
          carouselDietNo={carouselDietNo}
        />
      </Box>
    </MenuCard>
  );
};

export default CarouselContent;

const MenuCard = styled.View`
  height: ${FORMULA_CAROUSEL_HEIGHT + 24}px;
  margin: 0 32px;
  padding: 24px 0;
  z-index: 0;
`;

const Box = styled.View`
  width: 100%;
  height: ${FORMULA_CAROUSEL_HEIGHT}px;
  border-radius: 5px;
  padding-top: 24px;
  background-color: ${colors.white};
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
// width: "100%",
// paddingHorizontal: 16,
// marginTop: 24,
// justifyContent: "space-between",
