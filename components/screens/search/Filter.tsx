// RN
import React from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import {
  changeSelectedFilter,
  copySortFilter,
  initializeSortFilter,
  setFilterByRemainNutr,
} from "@/features/reduxSlices/sortFilterSlice";
import { openModal } from "@/features/reduxSlices/modalSlice";
import { FILTER_LIST, categoryCodeToName } from "@/shared/constants";
import colors from "@/shared/colors";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { icons } from "@/shared/iconSource";
import { checkisFiltered } from "@/shared/utils/screens/search/filterUtils";

import { Row, TextMain } from "@/shared/ui/styledComps";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

interface IFilter {
  setSearchBarFocus: React.Dispatch<React.SetStateAction<boolean>>;
}

const Filter = ({ setSearchBarFocus }: IFilter) => {
  // redux
  const dispatch = useAppDispatch();
  const { currentDietNo } = useAppSelector((state) => state.common);
  const { applied } = useAppSelector((state) => state.sortFilter);

  // react-query
  const { data: baseLineData } = useGetBaseLine();
  const { data: dTOData } = useListDietTotalObj();
  const dDData = dTOData?.[currentDietNo]?.dietDetail ?? [];

  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Row style={{ columnGap: 8 }}>
        {/* <RemainNutrFilterBtn
          onPress={() =>
            dispatch(
              setFilterByRemainNutr({ baseLineData, dietDetailData: dDData })
            )
          }
        >
          <FilterBtnText style={{ color: "white" }}>
            남은영양 이하
          </FilterBtnText>
        </RemainNutrFilterBtn> */}
        {FILTER_LIST.map((f, i) => {
          const isFiltered = checkisFiltered(applied.filter, f.id);
          return (
            <FilterBtn
              key={i}
              isActivated={isFiltered}
              onPress={() => {
                // filter bottom sheet 열 때 적용되어있는 sort, filter 복사
                dispatch(copySortFilter());
                dispatch(changeSelectedFilter(i));
                dispatch(openModal({ name: "filterBS" }));
              }}
            >
              <FilterBtnText isActivated={isFiltered}>
                {isFiltered && f.name === "category"
                  ? categoryCodeToName[applied.filter.category]
                  : f.label}
              </FilterBtnText>
            </FilterBtn>
          );
        })}
      </Row>
      <InitializeBtn
        onPress={() => {
          dispatch(initializeSortFilter());
          setSearchBarFocus(false);
        }}
      >
        <InitializeImg source={icons.initialize_24} />
      </InitializeBtn>
    </Row>
  );
};
export default Filter;

const FilterBtn = styled.TouchableOpacity<{ isActivated: boolean }>`
  height: 32px;
  padding: 6px 8px 6px 8px;
  border-radius: 16px;
  border-width: 1px;
  border-color: ${({ isActivated }) =>
    isActivated ? colors.main : colors.inactive};
  background-color: ${colors.white};
`;

// const RemainNutrFilterBtn = styled.TouchableOpacity`
//   height: 32px;
//   padding: 6px 8px 6px 8px;
//   border-radius: 5px;
//   background-color: ${colors.black};
// `;

const FilterBtnText = styled(TextMain)<{ isActivated?: boolean }>`
  font-size: 14px;
  line-height: 18px;
  color: ${({ isActivated }) =>
    isActivated ? colors.textMain : colors.textSub};
`;

const InitializeBtn = styled.TouchableOpacity`
  height: 32px;
  width: 24px;
  justify-content: center;
  align-items: center;
`;
const InitializeImg = styled.Image`
  width: 24px;
  height: 24px;
`;
