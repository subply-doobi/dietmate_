// RN, expo
import { useState } from "react";

// 3rd
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import styled from "styled-components/native";

// doobi
import {
  setSortBy,
  sortFilterStateInClient,
} from "@/features/reduxSlices/filteredPSlice";
import colors from "@/shared/colors";
import { SORT_LIST } from "@/shared/constants";
import DTooltip from "@/shared/ui/DTooltip";
import {
  BtnCTA,
  Col,
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
} from "@/shared/ui/styledComps";
import { closeBS } from "@/features/reduxSlices/bottomSheetSlice";
import Icon from "@/shared/ui/Icon";

const sortTooltipText: {
  [key: string]: string;
  priceCalorieCompare: string;
  priceProteinCompare: string;
} = {
  priceCalorieCompare: "가격대비 칼로리로 정렬합니다\n한국인은 효율!",
  priceProteinCompare:
    "가격대비 단백질양으로 정렬합니다\n헬창판별버튼이라는 소문이...",
};

const SortBSComp = () => {
  // redux
  const dispatch = useAppDispatch();
  const sortBy = useAppSelector((state) => state.filteredProduct.filter.sortBy);
  // remove "Asc" or "Desc" from sortBy for sortName
  const currentSortNm = sortBy?.replace(/Asc|Desc/g, "") || "";
  const sortState = sortBy?.endsWith("Asc")
    ? "Asc"
    : sortBy?.endsWith("Desc")
    ? "Desc"
    : "";

  // useState
  const [sortTooltipShow, setSortTooltipShow] = useState("");
  const [tempSortState, setTempSortState] = useState({
    sortNm: currentSortNm,
    sortState: sortState,
  });

  // fn
  const onSortBtnPress = (sortName: string) => {
    if (tempSortState.sortNm !== sortName) {
      // 정렬 상태가 변경되면 초기화
      setTempSortState({
        sortNm: sortName,
        sortState: "Asc", // 기본값은 Asc
      });
      return;
    } else {
      if (tempSortState.sortState === "Desc") {
        setTempSortState({
          sortNm: "",
          sortState: "",
        });
        return;
      }
      setTempSortState((prev) => ({
        ...prev,
        sortState:
          prev.sortState === ""
            ? "Asc"
            : prev.sortState === "Asc"
            ? "Desc"
            : "",
      }));
    }
  };

  const applySort = () => {
    dispatch(closeBS({ bsNm: "sort", from: "SortBSComp.tsx" }));
    dispatch(
      setSortBy(
        tempSortState.sortNm.concat(
          tempSortState.sortState
        ) as sortFilterStateInClient["filter"]["sortBy"]
      )
    );
  };

  return (
    <Container>
      <HorizontalSpace height={16} />
      {SORT_LIST.map((btn) => {
        const isActive = tempSortState.sortNm === btn.name;
        const btnLabel = !isActive
          ? btn.label
          : `${btn.label} ${
              tempSortState.sortState === "Asc" ? "낮은 순" : "높은 순"
            }`;
        return (
          // 각 정렬 버튼
          <Col key={btn.name}>
            <Button
              onPressIn={() => setSortTooltipShow(btn.name)}
              onPressOut={() => setSortTooltipShow("")}
              onPress={() => {
                onSortBtnPress(btn.name);
              }}
            >
              <SortRow>
                <Text isActive={isActive}>{btnLabel}</Text>
                <IconBox>
                  <Icon
                    name="sort"
                    iconSize={16}
                    color={colors.inactive}
                    style={{ position: "absolute", right: 0 }}
                  />
                  {btn.name === tempSortState.sortNm &&
                    tempSortState.sortState !== "" && (
                      <Icon
                        name={
                          tempSortState.sortState === "Asc"
                            ? "sortUp"
                            : "sortDown"
                        }
                        iconSize={16}
                        color={colors.main}
                        style={{ position: "absolute", right: 0 }}
                      />
                    )}
                </IconBox>
              </SortRow>

              {/* 가칼비, 가단비 툴팁 */}
              {(btn.name === "priceCalorieCompare" ||
                btn.name === "priceProteinCompare") && (
                <>
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
        );
      })}

      <BottomRow>
        <BtnCTA
          style={{ flex: 1 }}
          btnStyle={"border"}
          onPress={() => setTempSortState({ sortNm: "", sortState: "" })}
        >
          <BottomText style={{ color: colors.textSub }}>초기화</BottomText>
        </BtnCTA>
        <BtnCTA
          style={{ flex: 1, marginLeft: 8 }}
          btnStyle={"activated"}
          onPress={() => {
            applySort();
          }}
        >
          <BottomText>확인</BottomText>
        </BtnCTA>
      </BottomRow>
    </Container>
  );
};

export default SortBSComp;

const Container = styled.View`
  padding: 0 16px 24px 16px;
`;

const Text = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 20px;
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: center;
`;

const BottomText = styled.Text`
  font-size: 16px;
  line-height: 20px;
  color: ${colors.white};
`;
const Button = styled.Pressable`
  height: 58px;
  justify-content: center;
`;
const IconBox = styled.View`
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
