import { closeBS } from "@/features/reduxSlices/bottomSheetSlice";
import { setPlatformNm } from "@/features/reduxSlices/filteredPSlice";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import colors from "@/shared/colors";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { Col, HorizontalLine, Row, TextMain } from "@/shared/ui/styledComps";
import {
  sumUpDietFromDTOData,
  getSortedShippingPriceObj,
  commaToNum,
} from "@/shared/utils/sumUp";
import { useMemo } from "react";
import styled from "styled-components/native";

const PlatformFilterBSComp = () => {
  const dispatch = useAppDispatch();
  const platformDDItems = useAppSelector(
    (state) => state.common.platformDDItems
  );
  const platformArr = platformDDItems.map((item) => {
    return {
      value: item.value,
      label: item.value === "" ? "전체" : item.label,
    };
  });
  const platformNm = useAppSelector(
    (state) => state.filteredProduct.filter.platformNm
  );

  // react-query
  const { data: dTOData } = useListDietTotalObj();

  // useMemo
  const { firstTargetSeller, shippingPriceObj } = useMemo(() => {
    if (!dTOData) return { firstTargetSeller: "", shippingPriceObj: {} };
    const { shippingPriceObj } = sumUpDietFromDTOData(dTOData);
    const { free, notFree } = getSortedShippingPriceObj(shippingPriceObj);
    const firstTargetSeller = notFree[0]?.platformNm || "";
    return {
      firstTargetSeller,
      shippingPriceObj,
    };
  }, [dTOData]);

  // fn
  const selectPlatform = (platform: string) => {
    dispatch(
      closeBS({ bsNm: "platformFilter", from: "PlatformFilterBSComp.tsx" })
    );
    if (platformNm[0] === platform) {
      return;
    }
    if (platform === "") {
      dispatch(setPlatformNm([]));
      return;
    }
    dispatch(setPlatformNm([platform]));
  };
  return (
    <Col>
      {platformArr.map((item, idx) => {
        //     const remainText = `"${firstTargetSeller}" ${commaToNum(
        //   notFree[0]?.remainPrice
        // )}원 더 담으면 무료배송`;
        const obj = shippingPriceObj[item.value];
        let shippingText = "";
        if (!obj) {
          shippingText = "(아직 담은 식품이 없어요)";
        } else if (obj.remainPrice > 0) {
          shippingText = `(무료배송까지 ${commaToNum(obj.remainPrice)}원)`;
        } else {
          shippingText = "무료배송";
        }

        return (
          <Col key={item.value}>
            <CategoryBtn onPress={() => selectPlatform(item.value)}>
              <Row style={{ flex: 1 }}>
                <CategoryText
                  style={{ flex: 1 }}
                  isActive={
                    platformNm[0] === item.value ||
                    (item.value === "" && platformNm.length === 0)
                  }
                >
                  {item.label}
                </CategoryText>
                {idx !== 0 && (
                  <CategoryText
                    isActive={firstTargetSeller === item.value}
                    style={{
                      flex: 3,
                      fontWeight: "400",
                      fontSize: 12,
                    }}
                  >
                    {shippingText}
                  </CategoryText>
                )}
              </Row>
            </CategoryBtn>
            {idx !== platformArr.length - 1 && <HorizontalLine />}
          </Col>
        );
      })}
    </Col>
  );
};

export default PlatformFilterBSComp;

const CategoryBtn = styled.TouchableOpacity`
  width: 100%;
  height: 58px;
  flex-direction: row;
  padding: 0 32px;
  justify-content: flex-start;
  align-items: center;
`;

const CategoryText = styled(TextMain)<{ isActive: boolean }>`
  font-size: 16px;
  line-height: 20px;
  font-weight: ${({ isActive }) => (isActive ? "700" : "400")};
  color: ${({ isActive }) => (isActive ? colors.main : colors.textSub)};
  text-align: left;
`;
