import { ActivityIndicator, View } from "react-native";
import styled from "styled-components/native";

import {
  AccordionContentContainer,
  TextMain,
  Col,
  Row,
  HorizontalLine,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { commaToNum } from "@/shared/utils/sumUp";
import { regroupDDataBySeller } from "@/shared/utils/dataTransform";
import { ENV, MENU_LABEL } from "@/shared/constants";
import { useListDietTotalObj } from "@/shared/api/queries/diet";
import { IDietDetailData } from "@/shared/api/types/diet";

const FoodToOrder = () => {
  // redux
  const { data: dTOData, isLoading } = useListDietTotalObj();

  if (isLoading) {
    return <ActivityIndicator />;
  }
  return (
    <AccordionContentContainer style={{ rowGap: 40 }}>
      {dTOData &&
        Object.keys(dTOData).map((dietNo, index) => {
          if (dTOData[dietNo].dietDetail.length > 0)
            return (
              <Col key={`${dietNo}-${index}`}>
                <FoodsInOneDiet
                  idx={index}
                  dietNo={dietNo}
                  dDData={dTOData[dietNo]?.dietDetail || []}
                />
              </Col>
            );
        })}
    </AccordionContentContainer>
  );
};
interface FoodInOneDietProps {
  idx: number;
  dietNo: string;
  dDData: IDietDetailData;
}
const FoodsInOneDiet = ({ idx, dietNo, dDData }: FoodInOneDietProps) => {
  const { regrouped: dDDataBySeller } = regroupDDataBySeller(dDData);
  const platformNmArr = Object.keys(dDDataBySeller);

  if (!dDData) {
    return <ActivityIndicator />;
  }

  return (
    <Col>
      {dDData && (
        <View>
          <MenuTitle>{`${MENU_LABEL[idx]} ( x${dDData[0]?.qty} )`}</MenuTitle>
          <HorizontalLine
            style={{ marginTop: 8, backgroundColor: colors.line }}
          />
        </View>
      )}

      {platformNmArr?.map((platformNm) => {
        return (
          <View key={platformNm}>
            <SellerText numberOfLines={1} ellipsizeMode="tail">
              {platformNm}
            </SellerText>
            {dDDataBySeller[platformNm].map((product) => (
              <Row key={product.productNo} style={{ marginTop: 16 }}>
                <FoodThumbnail
                  source={{
                    uri: `${ENV.BASE_URL}${product.mainAttUrl}`,
                  }}
                />
                <Col style={{ flex: 1, marginLeft: 8 }}>
                  <ProductName numberOfLines={1} ellipsizeMode="tail">
                    {product.productNm}
                  </ProductName>
                  <Row
                    style={{
                      marginTop: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <PriceAndQuantity>
                      {commaToNum(product.price)}원
                    </PriceAndQuantity>
                  </Row>
                </Col>
              </Row>
            ))}
          </View>
        );
      })}
    </Col>
  );
};

export default FoodToOrder;

const MenuTitle = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;

const FoodThumbnail = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 5px;
`;

const SellerText = styled(TextMain)`
  margin-top: 24px;
  font-size: 14px;
`;

const ProductName = styled(TextMain)`
  font-size: 12px;
`;

const QuantityBox = styled.View`
  width: 80px;
  height: 24px;
`;

const PriceAndQuantity = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
`;
