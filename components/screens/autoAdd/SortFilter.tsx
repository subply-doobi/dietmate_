import {
  resetSortFilter,
  selectFilteredSortedProducts,
  setBaseListType,
  setLastFilteredList,
  setLiked,
  setPlatformNm,
  setRandom3,
  setRecentlyOpened,
  setRecentlyOrdered,
  setSearchQuery,
  setSortBy,
} from "@/features/reduxSlices/filteredPSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { icons } from "@/shared/iconSource";
import { Icon, TextMain, TextSub } from "@/shared/ui/styledComps";
import {
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";
import styled from "styled-components/native";

// Btn
// 1. available 2. total 3. search 4. lowerShipping 5. recentlyOpened 6. liked 7. recentlyOrdered
// 8. price 9. random

const SortFilter = () => {
  // navigation
  const autoAddType = useLocalSearchParams()?.type;

  // redux
  const dispatch = useAppDispatch();

  const {
    baseListType,
    sortBy,
    platformNm,
    recentlyOpened,
    liked,
    recentlyOrdered,
    searchQuery,
    random3,
  } = useAppSelector((state) => state.filteredProduct.filter);
  const lastAppliedFilter = useAppSelector(
    (state) => state.filteredProduct.lastAppliedFilter
  );
  const products = useAppSelector(selectFilteredSortedProducts);

  // useState
  const [isSearchPressed, setIsSearchPressed] = useState(false);

  // useRef
  const searchInputRef = useRef<TextInput>(null);
  const searchInputFocused = searchInputRef.current?.isFocused();
  // useEffect
  useEffect(() => {
    if (searchInputRef.current?.isFocused()) return;
    searchQuery.length === 0 && setIsSearchPressed(false);
  }, [searchInputFocused, searchQuery]);

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const firstTargetSeller = useMemo(() => {
    if (!dTOData) return "";
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const { free, notFree } = getSortedShippingPriceObj(shippingPriceObj);
    return notFree[0]?.platformNm || "";
  }, [dTOData]);

  // useEffect
  // 정렬일때는 lastFilteredList 저장해서 refiltering 필요 없도록 함
  useEffect(() => {
    if (lastAppliedFilter !== "sortBy") dispatch(setLastFilteredList(products));
  }, [lastAppliedFilter]);

  // BTNS isActive
  const isActiveObj = {
    availableFoods: baseListType === "availableFoods",
    totalFoodList: baseListType === "totalFoodList",
    search: isSearchPressed && searchQuery.length > 0,
    platformNm: platformNm.length > 0,
    recentlyOpened: recentlyOpened,
    liked: liked,
    recentlyOrdered: recentlyOrdered,
    sortBy: sortBy === "priceAsc" || sortBy === "priceDesc",
    random3: random3,
  };

  const BTNS = [
    // 목표영양
    {
      id: "availableFoods",
      label: isActiveObj.availableFoods ? "목표영양에 적합한" : "",
      isActive: isActiveObj.availableFoods,
      iconSource: isActiveObj.availableFoods
        ? icons.targetActive_24
        : icons.targetInactive_24,
      iconSize: 18,
      iconStyle: undefined,
      onPress: () =>
        !isActiveObj.availableFoods &&
        dispatch(setBaseListType("availableFoods")),
    },
    // 전체식품
    {
      id: "totalFoodList",
      label: isActiveObj.totalFoodList ? "전체" : "",
      isActive: isActiveObj.totalFoodList,
      iconSource: isActiveObj.totalFoodList
        ? icons.targetxActive24
        : icons.targetxInactive24,
      iconSize: undefined,
      iconStyle: undefined,
      onPress: () =>
        !isActiveObj.totalFoodList &&
        dispatch(setBaseListType("totalFoodList")),
    },
    // 검색
    {
      id: "search",
      label: isActiveObj.search ? `"${searchQuery}" 검색된` : "",
      isActive: isActiveObj.search,
      iconSource: isActiveObj.search ? icons.cancelLine_24 : icons.search_36,
      iconSize: 24,
      iconStyle: { marginLeft: isSearchPressed ? 4 : 0 },
      onPress: () => {
        if (isActiveObj.search) {
          dispatch(setSearchQuery(""));
          setIsSearchPressed(false);
          return;
        }
        setIsSearchPressed(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
        // if (searchInputRef.current?.isFocused()) return;
      },
    },
    // 배송비 절약
    {
      id: "platformNm",
      label: "무료배송에 근접한",
      isActive: isActiveObj.platformNm,
      iconSource: isActiveObj.platformNm
        ? icons.truckActive_24
        : icons.truckInactive_24,
      iconSize: 24,
      iconStyle: undefined,
      onPress: () => {
        platformNm.length === 0
          ? dispatch(setPlatformNm([firstTargetSeller]))
          : dispatch(setPlatformNm([]));
      },
    },
    // 최근 본
    {
      id: "recentlyOpened",
      label: "최근 본",
      isActive: isActiveObj.recentlyOpened,
      iconSource: isActiveObj.recentlyOpened
        ? icons.eyeActive_24
        : icons.eyeInactive_24,
      iconSize: undefined,
      iconStyle: undefined,
      onPress: () => {
        dispatch(setRecentlyOpened(!recentlyOpened));
      },
    },
    // 좋아요
    {
      id: "liked",
      label: "좋아요 누른",
      isActive: isActiveObj.liked,
      iconSource: isActiveObj.liked ? icons.heart_active_36 : icons.heart_36,
      iconSize: 20,
      iconStyle: undefined,
      onPress: () => {
        dispatch(setLiked(!liked));
      },
    },
    // 최근 주문
    {
      id: "recentlyOrdered",
      label: "최근 주문",
      isActive: isActiveObj.recentlyOrdered,
      iconSource: isActiveObj.recentlyOrdered
        ? icons.cardActive_24
        : icons.cardInactive_24,
      iconSize: undefined,
      iconStyle: undefined,
      onPress: () => {
        dispatch(setRecentlyOrdered(!recentlyOrdered));
      },
    },
    // 무작위
    {
      id: "random3",
      label: "식품 중 무작위 3개",
      isActive: isActiveObj.random3,
      iconSource: isActiveObj.random3 ? icons.dice_36_active : icons.dice_36,
      iconSize: 24,
      iconStyle: undefined,
      onPress: () => {
        random3 ? dispatch(setRandom3(false)) : dispatch(setRandom3(true));
      },
    },
    // 가격 정렬
    {
      id: "sortByPrice",
      label:
        sortBy === "priceAsc"
          ? "가격 저렴한 순"
          : sortBy === "priceDesc"
          ? "가격 비싼 순"
          : "",
      isActive: isActiveObj.sortBy,
      iconSource: !sortBy
        ? icons.moneyInactive_24
        : sortBy === "priceAsc"
        ? icons.sortAscending_24
        : icons.sortDescending_24,
      iconSize: undefined,
      iconStyle: undefined,
      onPress: () => {
        if (sortBy === "priceAsc") {
          dispatch(setSortBy("priceDesc"));
        } else if (sortBy === "priceDesc") {
          dispatch(setSortBy(null));
        } else {
          dispatch(setSortBy("priceAsc"));
        }
      },
    },
    // 초기화
    {
      id: "resetSortFilter",
      label: "초기화",
      isActive: false,
      iconSource: icons.initialize_24,
      iconSize: 20,
      iconStyle: undefined,
      onPress: () => {
        dispatch(resetSortFilter());
      },
    },
  ];

  // subTitle text -> BTNS labels concat
  const subTitleText = BTNS.reduce((acc, btn) => {
    if (btn.isActive && btn.label) {
      return acc + (acc ? ", " : "") + btn.label;
    }
    return acc;
  }, "").concat(" 식품입니다.");

  return (
    <Container>
      <Box>
        {BTNS.map((btn, idx) => (
          <Btn
            key={idx}
            onPress={btn.onPress}
            style={{
              borderColor: btn.isActive ? colors.main : colors.lineLight,
            }}
          >
            {btn.id === "search" && isSearchPressed && (
              <SearchTextInput
                ref={searchInputRef}
                placeholder="검색어 입력"
                placeholderTextColor={colors.textSub}
                onChangeText={(t) => dispatch(setSearchQuery(t))}
                value={searchQuery}
              />
            )}
            {btn.iconSource && (
              <Icon
                source={btn.iconSource}
                size={btn.iconSize || 20}
                style={btn.iconStyle || {}}
              />
            )}
          </Btn>
        ))}
      </Box>
      <Title>
        {autoAddType === "add" ? "추가 가능한" : "교체 가능한"}{" "}
        {products.length}개 식품이 검색되었어요
      </Title>
      <SubTitle>{subTitleText}</SubTitle>
    </Container>
  );
};

export default SortFilter;

const Container = styled.View`
  width: 100%;
  margin-bottom: 24px;
`;

const Box = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  height: 40px;
  background-color: ${colors.white};
  border-radius: 20px;
  border-width: 1px;
  border-color: ${colors.lineLight};

  justify-content: center;
  align-items: center;
  column-gap: 4px;

  padding: 8px 16px;
`;

const BtnText = styled(TextSub)`
  font-size: 12px;
  line-height: 18px;
  color: ${colors.textSub};
`;

const SearchTextInput = styled.TextInput`
  height: 32px;
  font-size: 12px;
  line-height: 18px;
  color: ${colors.textMain};
  font-weight: 300;
`;

const Title = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  margin-top: 24px;
  margin-left: 4px;
`;
const SubTitle = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  margin-top: 4px;
  margin-left: 4px;
`;
