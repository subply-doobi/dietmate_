import { Tabs, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Icon } from "@/shared/ui/styledComps";
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import BackArrow from "@/shared/ui/BackArrow";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { tfDTOToDDA } from "@/shared/utils/dataTransform";
import styled from "styled-components/native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const router = useRouter();

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const dietDetailAllData = useMemo(() => {
    const dietDetailAllData = dTOData ? tfDTOToDDA(dTOData) : [];
    return dietDetailAllData;
  }, [dTOData]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* NewHome - Search - Mypage - Diet */}
      <Tabs.Screen
        name="index"
        options={{
          title: "NewHome",
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? icons.mainActive_36 : icons.main_36}
              size={36}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? icons.searchActive_36 : icons.search_36}
              size={36}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Mypage"
        options={{
          headerShown: true,
          headerTitle: "마이페이지",
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.textMain,
          },
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? icons.mypageActive_36 : icons.mypage_36}
              size={36}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Diet"
        options={{
          tabBarIcon: ({ focused }) => (
            <CartIcon>
              <Icon
                source={focused ? icons.cartActive_36 : icons.cart_36}
                size={36}
              />
              {dietDetailAllData.length !== 0 && (
                <Badge>
                  <BadgeText>{dietDetailAllData.length}</BadgeText>
                </Badge>
              )}
            </CartIcon>
          ),
          tabBarShowLabel: false,
          headerShown: true,
          headerTitle: "식단구성",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.textMain,
          },
          headerLeft: () => (
            <BackArrow goBackFn={router.back} style={{ marginLeft: 16 }} />
          ),
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
