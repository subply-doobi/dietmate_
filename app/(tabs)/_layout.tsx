import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Icon } from "@/shared/ui/styledComps";
import { icons } from "@/shared/iconSource";
import colors from "@/shared/colors";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { tfDTOToDDA } from "@/shared/utils/dataTransform";
import styled from "styled-components/native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? icons.mainActive_36 : icons.main_36}
              size={36}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Formula"
        options={{
          title: "Formula",
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? icons.formulaActive_36 : icons.formula_36}
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
