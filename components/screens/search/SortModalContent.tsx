// RN, expo
import { useState } from "react";
import styled from "styled-components/native";

// 3rd

// doobi
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import { SORT_LIST } from "@/shared/constants";
import {
  applySortFilter,
  initializeSort,
  updateSort,
} from "@/features/reduxSlices/sortFilterSlice";
import { closeModal } from "@/features/reduxSlices/modalSlice";

import {
  Row,
  HorizontalLine,
  BtnCTA,
  HorizontalSpace,
  Col,
} from "@/shared/ui/styledComps";
import DTooltip from "@/shared/ui/DTooltip";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const sortTooltipText: {
  [key: string]: string;
  priceCalorieCompare: string;
  priceProteinCompare: string;
} = {
  priceCalorieCompare: "가격대비 칼로리로 정렬합니다\n한국인은 효율!",
  priceProteinCompare:
    "가격대비 단백질양으로 정렬합니다\n헬창판별버튼이라는 소문이...",
};

const SortModalContent = () => {
  // redux
  const dispatch = useAppDispatch();
  const {
    copied: { sort: sortState },
  } = useAppSelector((state) => state.sortFilter);

  // useState
  const [sortTooltipShow, setSortTooltipShow] = useState("");

  return (
    <Container>
      <HorizontalSpace height={16} />
      {SORT_LIST.map((btn) => (
        // 각 정렬 버튼
        <Col key={btn.name}>
          <Button
            onPress={() => {
              dispatch(updateSort(btn.name));
            }}
          >
            <SortRow>
              <Text>{btn.label}</Text>
              <Image
                source={
                  sortState[btn.name] === "ASC"
                    ? icons.sortAscending_24
                    : sortState[btn.name] === "DESC"
                    ? icons.sortDescending_24
                    : icons.sort_24
                }
              />
            </SortRow>

            {/* 가칼비, 가단비 툴팁 */}
            {(btn.name === "priceCalorieCompare" ||
              btn.name === "priceProteinCompare") && (
              <>
                <TooltipBtn
                  onPressIn={() =>
                    btn.name === "priceCalorieCompare"
                      ? setSortTooltipShow("priceCalorieCompare")
                      : setSortTooltipShow("priceProteinCompare")
                  }
                  onPressOut={() => setSortTooltipShow("")}
                >
                  <TooltipImage source={icons.question_24} />
                </TooltipBtn>
                <DTooltip
                  tooltipShow={btn.name === sortTooltipShow}
                  text={sortTooltipText[sortTooltipShow]}
                  boxLeft={0}
                  boxBottom={42}
                  triangleLeft={12}
                />
              </>
            )}
          </Button>
          {SORT_LIST.length !== btn.id + 1 && <HorizontalLine />}
        </Col>
      ))}

      <BottomRow>
        <BtnCTA
          style={{ flex: 1 }}
          btnStyle={"border"}
          onPress={() => dispatch(initializeSort())}
        >
          <BottomText style={{ color: colors.textSub }}>초기화</BottomText>
        </BtnCTA>
        <BtnCTA
          style={{ flex: 1, marginLeft: 8 }}
          btnStyle={"activated"}
          onPress={() => {
            dispatch(applySortFilter());
            dispatch(closeModal({ name: "sortBS" }));
          }}
        >
          <BottomText>확인</BottomText>
        </BtnCTA>
      </BottomRow>
    </Container>
  );
};

export default SortModalContent;
const Container = styled.View``;

const Text = styled.Text`
  font-size: 16px;
`;

const BottomText = styled.Text`
  font-size: 16px;
  color: ${colors.white};
`;
const Button = styled.TouchableOpacity`
  height: 58px;
  justify-content: center;
`;
const Image = styled.Image`
  width: 24px;
  height: 24px;
  position: absolute;
  right: 0;
  align-self: center;
`;
const SortRow = styled(Row)`
  justify-content: center;
`;
const BottomRow = styled.View`
  margin-top: 16px;
  flex-direction: row;
  justify-content: center;
`;

const TooltipBtn = styled.Pressable`
  position: absolute;
  left: 0px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

const TooltipImage = styled.Image`
  width: 24px;
  height: 24px;
`;
