import { Tabs } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import colors from "@/shared/colors";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { tfDTOToDDA } from "@/shared/utils/dataTransform";
import styled from "styled-components/native";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { useListProduct } from "@/shared/api/queries/product";
import { setTotalFoodList } from "@/features/reduxSlices/commonSlice";
import { PRODUCTS } from "@/shared/api/keys";
import { queryClient } from "@/shared/store/reactQueryStore";
import Icon from "@/shared/ui/Icon";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // redux
  const dispatch = useAppDispatch();
  const isTotalFoodListLoaded = useAppSelector(
    (state) => state.common.totalFoodListIsLoaded
  );
  const initialSortFilterState = useAppSelector((state) => state.sortFilter);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const initialDietNo = Object.keys(dTOData || {})[0] || "";
  const { refetch: refetchLPData } = useListProduct(
    {
      dietNo: initialDietNo,
      appliedSortFilter: initialSortFilterState.applied,
    },
    {
      enabled: false,
    }
  );

  // useMemo
  const dietDetailAllData = useMemo(() => {
    const dietDetailAllData = dTOData ? tfDTOToDDA(dTOData) : [];
    return dietDetailAllData;
  }, [dTOData]);

  useEffect(() => {
    if (!dTOData) return;
    if (isTotalFoodListLoaded) return;
    if (initialDietNo === "") return;
    const loadTotalFoodList = async () => {
      const lPData = (await refetchLPData()).data;
      if (!lPData) return;
      dispatch(setTotalFoodList(lPData));
      queryClient.removeQueries({ queryKey: [PRODUCTS, initialDietNo] });
    };
    loadTotalFoodList();
  }, [dTOData, initialDietNo]);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarLabelPosition: "beside-icon",
        tabBarButton: (
          props: React.JSX.IntrinsicAttributes &
            TouchableOpacityProps &
            React.RefAttributes<View>
        ) => <TouchableOpacity {...props} activeOpacity={0.5} />,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* NewHome - formula - Search - Cart */}
      <Tabs.Screen
        name="index"
        options={{
          title: "NewHome",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Icon
              name={focused ? "home" : "homeOutline"}
              boxSize={36}
              iconSize={focused ? 24 : 22}
              color={focused ? colors.main : colors.inactive}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Formula"
        options={{
          title: "Formula",
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Icon
              name={focused ? "calculator" : "calculatorOutline"}
              boxSize={36}
              iconSize={focused ? 30 : 24}
              color={focused ? colors.main : colors.inactive}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Diet"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <CartIcon>
              <Icon
                name={focused ? "cart" : "cartOutline"}
                boxSize={36}
                iconSize={focused ? 28 : 24}
                color={focused ? colors.main : colors.inactive}
              />
              {dietDetailAllData.length !== 0 && (
                <Badge
                  style={{
                    backgroundColor: focused ? colors.main : colors.pink,
                  }}
                >
                  <BadgeText>{dietDetailAllData.length}</BadgeText>
                </Badge>
              )}
            </CartIcon>
          ),
          tabBarShowLabel: false,
          headerShown: true,
          headerTitle: "공식확인",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.textMain,
          },
        }}
      />
    </Tabs>
  );
}

const CartIcon = styled.View`
  width: 36px;
  height: 36px;
`;

const Badge = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${colors.main};
  position: absolute;
  right: 0px;
  top: 0px;
  justify-content: center;
  align-items: center;
`;
const BadgeText = styled.Text`
  color: ${colors.white};
  font-size: 10px;
`;
