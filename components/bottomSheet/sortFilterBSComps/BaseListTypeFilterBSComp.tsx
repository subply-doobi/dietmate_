import {
  closeBS,
  setProductToDel,
} from "@/features/reduxSlices/bottomSheetSlice";
import { setBaseListType } from "@/features/reduxSlices/filteredPSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, HorizontalLine, TextMain } from "@/shared/ui/styledComps";
import { usePathname, useRouter } from "expo-router";
import styled from "styled-components/native";

const BASE_LIST_TYPE = {
  availableFoods: "영양목표 달성 가능한 식품",
  totalFoodList: "전체 식품",
};

const BaseListTypeFilterBSComp = () => {
  // navigation
  const pathName = usePathname();
  const router = useRouter();

  // redux
  const dispatch = useAppDispatch();
  const currentFMCIdx = useAppSelector((state) => state.formula.currentFMCIdx);
  const baseListType = useAppSelector(
    (state) => state.filteredProduct.filter.baseListType
  );
  const pToAdd = useAppSelector((state) => state.bottomSheet.bsData.pToAdd);

  // react-query
  const { data: dTOData } = useListDietTotalObj();
  const currentDietNo = Object.keys(dTOData || {})[currentFMCIdx];
  const dDData = dTOData?.[currentDietNo]?.dietDetail || [];

  const selectBaseListType = (type: "totalFoodList" | "availableFoods") => {
    dispatch(
      closeBS({
        bsNm: "baseListTypeFilter",
        from: "BaseListTypeFilterBSComp.tsx",
      })
    );
    if (pathName === "/Search" && type === "availableFoods") {
      pToAdd.length > 0 && dispatch(setProductToDel([]));
      router.push({
        pathname: "/AutoAdd",
        params: { menu: JSON.stringify(dDData), type: "add" },
      });
      return;
    }

    if (type === baseListType) {
      dispatch(
        closeBS({
          bsNm: "baseListTypeFilter",
          from: "BaseListTypeFilterBSComp.tsx",
        })
      );
      return;
    }
    dispatch(setBaseListType(type));
    dispatch(
      closeBS({
        bsNm: "baseListTypeFilter",
        from: "BaseListTypeFilterBSComp.tsx",
      })
    );
  };

  return (
    <Col>
      {Object.values(BASE_LIST_TYPE).map((type, idx) => (
        <Col key={idx}>
          <Btn
            key={idx}
            onPress={() => {
              selectBaseListType(
                Object.keys(BASE_LIST_TYPE)[idx] as
                  | "totalFoodList"
                  | "availableFoods"
              );
            }}
          >
            <Text isActive={baseListType === Object.keys(BASE_LIST_TYPE)[idx]}>
              {type}
            </Text>
          </Btn>
          {idx !== Object.values(BASE_LIST_TYPE).length - 1 && (
            <HorizontalLine />
          )}
        </Col>
      ))}
    </Col>
  );
};

export default BaseListTypeFilterBSComp;

const Btn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Text = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 20px;
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: center;
`;
