import { openBS } from "@/features/reduxSlices/bottomSheetSlice";
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
import { categoryCodeToName, SORT_FILTER_HEIGHT } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import DTooltip from "@/shared/ui/DTooltip";
import Icon, { IconName } from "@/shared/ui/Icon";
import { TextMain, TextSub } from "@/shared/ui/styledComps";
import {
  commaToNum,
  getSortedShippingPriceObj,
  sumUpDietFromDTOData,
} from "@/shared/utils/sumUp";
import { useBottomSheet, useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styled from "styled-components/native";

const SortFilter = () => {
  // navigation
  // const autoAddType = useLocalSearchParams()?.type;
  const pathName = usePathname();

  // redux
  const dispatch = useAppDispatch();
  const {
    baseListType,
    category,
    searchQuery,
    platformNm,
    recentlyOpened,
    liked,
    recentlyOrdered,
    random3,
    sortBy,
  } = useAppSelector((state) => state.filteredProduct.filter);
  const currentSortNm = sortBy?.replace(/Asc|Desc/g, "") || "";
  const sortState = sortBy?.endsWith("Asc")
    ? "Asc"
    : sortBy?.endsWith("Desc")
    ? "Desc"
    : "";

  const lastAppliedFilter = useAppSelector(
    (state) => state.filteredProduct.lastAppliedFilter
  );
  const products = useAppSelector(selectFilteredSortedProducts);

  // useState
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isTooltipShow, setIsTooltipShow] = useState(true);

  // useRef
  const searchInputRef = useRef<TextInput>(null);

  // useEffect
  useEffect(() => {
    isSearchActive
      ? setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100)
      : searchInputRef.current?.blur();
  }, [isSearchActive]);

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { firstTargetSeller, tooltipText, priceTotal } = useMemo(() => {
    if (!dTOData) return { firstTargetSeller: "", tooltipText: "" };
    const { shippingPriceObj, priceTotal } = sumUpDietFromDTOData(dTOData);
    const { free, notFree } = getSortedShippingPriceObj(shippingPriceObj);
    const firstTargetSeller = notFree[0]?.platformNm || "";
    const tooltipText = `"${firstTargetSeller}" 무료배송까지 ${commaToNum(
      notFree[0]?.remainPrice
    )}원`;

    return {
      firstTargetSeller,
      tooltipText,
      priceTotal,
    };
  }, [dTOData]);

  // useEffect
  // 정렬일때는 lastFilteredList 저장해서 refiltering 필요 없도록 함
  useEffect(() => {
    if (lastAppliedFilter !== "sortBy") dispatch(setLastFilteredList(products));
  }, [lastAppliedFilter]);

  // BTNS isActive
  const isActiveObj = {
    baseListType: baseListType === "availableFoods",
    category: category !== "",
    search: isSearchActive,
    platformNm: platformNm.length > 0,
    recentlyOpened: recentlyOpened,
    liked: liked,
    recentlyOrdered: recentlyOrdered,
    sortBy: sortBy !== "",
    random3: random3,
  };

  interface IBtn {
    id: string;
    label: string;
    isActive: boolean;
    iconName: IconName | undefined;
    iconSize: number;
    iconColor: string;
    onPress: () => void;
  }
  const BTNS: IBtn[] = [
    {
      id: "baseListType",
      label: baseListType === "availableFoods" ? "영양목표" : "전체",
      isActive: isActiveObj.baseListType,
      iconName: "target",
      iconSize: 18,
      iconColor: isActiveObj.baseListType ? colors.main : colors.textSub,
      onPress: () => dispatch(openBS("baseListTypeFilter")),
    },
    // 카테고리
    {
      id: "category",
      label: category ? categoryCodeToName[category] : "카테고리",
      isActive: isActiveObj.category,
      iconName: undefined,
      iconSize: 18,
      iconColor: isActiveObj.category ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(openBS("categoryFilter"));
      },
    },
    // 검색
    {
      id: "search",
      label: "",
      isActive: isActiveObj.search,
      iconName: isActiveObj.search ? "cancelCircle" : "search",
      iconSize: 16,
      iconColor: isActiveObj.search ? colors.main : colors.textSub,
      onPress: () => {
        if (isActiveObj.search) {
          if (searchQuery.length > 0) {
            dispatch(setSearchQuery(""));
          }
          setIsSearchActive(false);
          searchInputRef.current?.blur();
        } else {
          setIsSearchActive(true);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 100);
        }
      },
    },
    // 배송비 절약
    {
      id: "platformNm",
      label: platformNm.length === 0 ? "배송비 절약" : platformNm[0],
      isActive: isActiveObj.platformNm,
      iconName: "truck",
      iconSize: 18,
      iconColor: isActiveObj.platformNm ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(openBS("platformFilter"));
        isTooltipShow && setIsTooltipShow(false);
      },
    },
    // 최근 본
    {
      id: "recentlyOpened",
      label: "최근 본",
      isActive: isActiveObj.recentlyOpened,
      iconName: "eye",
      iconSize: 18,
      iconColor: isActiveObj.recentlyOpened ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(setRecentlyOpened(!recentlyOpened));
      },
    },
    // 좋아요
    {
      id: "liked",
      label: "좋아요",
      isActive: isActiveObj.liked,
      iconName: isActiveObj.liked ? "heart" : "heartBorder",
      iconSize: 16,
      iconColor: isActiveObj.liked ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(setLiked(!liked));
      },
    },
    // 최근 주문
    {
      id: "recentlyOrdered",
      label: "최근 주문",
      isActive: isActiveObj.recentlyOrdered,
      iconName: "creditCard",
      iconSize: 16,
      iconColor: isActiveObj.recentlyOrdered ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(setRecentlyOrdered(!recentlyOrdered));
      },
    },
    // 가격 정렬
    {
      id: "sort",
      label:
        currentSortNm === "price"
          ? "가격"
          : currentSortNm === "calorie"
          ? "칼로리"
          : currentSortNm === "protein"
          ? "단백질"
          : currentSortNm === "carb"
          ? "탄수화물"
          : currentSortNm === "fat"
          ? "지방"
          : currentSortNm === "priceCalorieCompare"
          ? "가칼비"
          : currentSortNm === "priceProteinCompare"
          ? "가단비"
          : "정렬",
      isActive: isActiveObj.sortBy,
      iconName:
        sortState === "Asc"
          ? "sortUp"
          : sortState === "Desc"
          ? "sortDown"
          : "sort",
      iconSize: 14,
      iconColor: isActiveObj.sortBy ? colors.main : colors.textSub,
      onPress: () => {
        dispatch(openBS("sort"));
      },
    },
    // 초기화
    {
      id: "resetSortFilter",
      label: "",
      isActive: false,
      iconName: "refresh",
      iconSize: 16,
      iconColor: colors.textSub,
      onPress: () => {
        dispatch(resetSortFilter("availableFoods"));
      },
    },
  ];
  // search screen에서는 baseListType 버튼 사용 안함
  if (pathName.includes("Search")) {
    BTNS.shift();
  }

  return (
    <ScrollView
      style={{ height: SORT_FILTER_HEIGHT }}
      keyboardShouldPersistTaps="always"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        columnGap: 8,
        paddingTop: 32,
        paddingBottom: 8,
        paddingHorizontal: 16,
        zIndex: 100,
      }}
    >
      {BTNS.map((btn, idx) => (
        <Btn
          key={idx}
          onPress={btn.onPress}
          style={{
            borderColor: btn.isActive ? colors.main : colors.lineLight,
          }}
        >
          {btn.id === "search" && btn.isActive && (
            <SearchTextInput
              ref={searchInputRef}
              placeholder="검색어 입력"
              placeholderTextColor={colors.textSub}
              onChangeText={(t) => dispatch(setSearchQuery(t))}
              value={searchQuery}
            />
          )}
          {btn.iconName && (
            <Icon
              name={btn.iconName}
              boxSize={20}
              iconSize={btn.iconSize}
              color={btn.iconColor}
              style={{ marginLeft: !!btn.iconName && !!btn.label ? -6 : 0 }}
            />
          )}
          {btn.label && <BtnText>{btn.label}</BtnText>}
          {btn.id === "platformNm" && !!firstTargetSeller && (
            <DTooltip
              text={tooltipText}
              color={colors.main}
              tooltipShow={isTooltipShow}
              boxTop={-28}
              boxLeft={8}
            />
          )}
        </Btn>
      ))}
    </ScrollView>
  );
};

export default SortFilter;

const Btn = styled.TouchableOpacity`
  flex-direction: row;
  height: 40px;
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
