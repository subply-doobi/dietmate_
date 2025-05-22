// RN, expo
import { useEffect, useState } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { icons } from "@/shared/iconSource";
import { BtnSmall, BtnSmallText, Row, TextMain } from "@/shared/ui/styledComps";
import FoodList from "./FoodList";

// react-query
import { IDietDetailData } from "@/shared/api/types/diet";
import { useDeleteDietDetail } from "@/shared/api/queries/diet";
import { openModal, closeModal } from "@/features/reduxSlices/modalSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { usePathname } from "expo-router";

interface IMenu {
  dietNo: string;
  dietDetailData: IDietDetailData;
}

const Menu = ({ dietNo, dietDetailData }: IMenu) => {
  // etc
  const isDietEmpty = dietDetailData.length === 0;

  return (
    <Container>
      {/* 현재 끼니 식품들 */}
      {!isDietEmpty && <FoodList dietNo={dietNo} />}
    </Container>
  );
};

export default Menu;

const Container = styled.View``;
