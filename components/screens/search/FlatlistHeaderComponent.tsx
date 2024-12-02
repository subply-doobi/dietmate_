// RN, expo
import { Animated, TextInput } from "react-native";
import { SetStateAction, useEffect, useRef, useState } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import {
  HorizontalLine,
  HorizontalSpace,
  Row,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import Filter from "./Filter";

import {
  applySortFilter,
  copySortFilter,
  initializeSearch,
  updateSearch,
} from "@/features/reduxSlices/sortFilterSlice";
import { SORT_LIST } from "@/shared/constants";
import { openModal } from "@/features/reduxSlices/modalSlice";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

interface ISortImg {
  [key: string]: any;
  ASC: any;
  DESC: any;
  "": any;
}
const sortImg: ISortImg = {
  ASC: icons.sortAscending_24,
  DESC: icons.sortDescending_24,
  "": icons.sort_24,
};

interface IFlatlistHeaderComponent {
  translateY: any;
  searchedNum: number | undefined;
}
const FlatlistHeaderComponent = ({
  translateY,
  searchedNum,
}: IFlatlistHeaderComponent) => {
  // redux
  const dispatch = useAppDispatch();
  const { copied: sortFilterCopied, applied: sortFilterApplied } =
    useAppSelector((state) => state.sortFilter);
  const { isTutorialMode, tutorialProgress } = useAppSelector(
    (state) => state.common
  );

  //state
  const [searchBarFocus, setSearchBarFocus] = useState(false);

  // ref
  const searchInputRef = useRef<TextInput | null>(null);
  useEffect(() => {
    searchBarFocus &&
      sortFilterCopied.filter.search === "" &&
      searchInputRef.current?.focus();
  }, [searchBarFocus]);

  useEffect(() => {
    sortFilterApplied.filter.search !== "" && setSearchBarFocus(true);
  }, [sortFilterApplied]);

  // etc
  // 현재 정렬 value, label
  const sortKey = Object.keys(sortFilterApplied.sort).find(
    (key) => sortFilterApplied.sort[key]
  );
  const sortValue = sortKey ? sortFilterApplied.sort[sortKey] : "";
  const sortLabel = sortKey
    ? SORT_LIST[SORT_LIST.findIndex((item) => item.name === sortKey)].label
    : "정렬";

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        transform:
          isTutorialMode && tutorialProgress === "SelectFood"
            ? []
            : [{ translateY: translateY }],
        zIndex: 1,
        backgroundColor: "white",
      }}
    >
      <Row
        style={{
          flex: 1,
          justifyContent: "space-between",
          marginTop: 16,
          alignItems: "flex-end",
        }}
      >
        <Row style={{ alignItems: "flex-end", flex: 1 }}>
          <ListTitle>검색된 결과 </ListTitle>

          <NoOfFoods>{searchedNum ? `${searchedNum}개` : ``}</NoOfFoods>

          {searchBarFocus ? (
            <SearchBox style={{ flex: 1, marginRight: 8 }}>
              <SearchInput
                onChangeText={(text) => dispatch(updateSearch(text))}
                value={sortFilterCopied.filter.search}
                ref={searchInputRef}
                placeholder="검색어 입력"
                onSubmitEditing={() => dispatch(applySortFilter())}
              />
              <SearchCancelBtn
                onPress={() => {
                  dispatch(initializeSearch());
                  dispatch(applySortFilter());
                  setSearchBarFocus(false);
                }}
              >
                <SearchCancelImage source={icons.cancelRound_24} />
              </SearchCancelBtn>
            </SearchBox>
          ) : (
            <SearchBtn onPress={() => setSearchBarFocus(true)}>
              <SearchImage source={icons.search_18} />
            </SearchBtn>
          )}
        </Row>

        {/* 정렬 */}
        <SortBtn
          onPress={() => {
            // sort bottom sheet 열 때 적용되어있는 sort, filter 복사
            dispatch(copySortFilter());
            dispatch(openModal({ name: "sortBS" }));
          }}
        >
          <SortBtnText>{sortLabel}</SortBtnText>
          <SortImage source={sortImg[sortValue]} />
        </SortBtn>
      </Row>

      <HorizontalLine style={{ marginTop: 8 }} />
      <HorizontalSpace height={8} />

      {/* 필터 (검색 제외) */}
      <Filter setSearchBarFocus={setSearchBarFocus} />

      <HorizontalSpace height={16} />
    </Animated.View>
  );
};

export default FlatlistHeaderComponent;

const SearchBox = styled.View`
  flex-direction: row;
  margin-left: 8px;
  height: 32px;
  align-items: center;
  background-color: ${colors.bgBox};
  justify-content: space-between;
`;

const SearchInput = styled.TextInput`
  border-radius: 4px;
  font-size: 14px;
  color: ${colors.textSub};
  padding: 0 8px;
`;

const SearchCancelBtn = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  margin-right: 4px;
`;

const SearchCancelImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const ListTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
`;
const NoOfFoods = styled(TextSub)`
  font-size: 16px;
  font-weight: bold;
`;

const SortBtn = styled.TouchableOpacity`
  flex-direction: row;
  /* align-items: flex-end; */
  align-items: center;
  /* justify-content: center; */
`;

const SortBtnText = styled(TextSub)`
  font-size: 14px;
`;

const SortImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const SearchImage = styled.Image`
  width: 24px;
  height: 24px;
`;

const SearchBtn = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  margin-left: 12px;
  background-color: ${colors.backgroundLight2};
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`;
