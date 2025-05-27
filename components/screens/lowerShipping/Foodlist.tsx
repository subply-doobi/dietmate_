import { IDietDetailData } from "@/shared/api/types/diet";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { Col, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { commaToNum } from "@/shared/utils/sumUp";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import styled from "styled-components/native";

const Foodlist = ({
  dDData,
  mainTextColor,
}: {
  dDData: IDietDetailData;
  mainTextColor?: string;
}) => {
  // navigation
  const router = useRouter();
  return (
    <FoodlistBox>
      {dDData.map((p, idx) => (
        <Row key={idx} style={{ flex: 1, columnGap: 8 }}>
          <ImageBtn
            onPress={() => {
              Toast.hide();
              router.push({
                pathname: "/FoodDetail",
                params: { productNo: p.productNo, type: "infoOnly" },
              });
            }}
          >
            <Thumbnail
              source={{ uri: `${ENV.BASE_URL}${p.mainAttUrl}` }}
              resizeMode="cover"
            />
          </ImageBtn>
          <Col style={{ flex: 1, rowGap: 1 }}>
            <SubText>{p.platformNm}</SubText>
            <Row
              style={{
                justifyContent: "space-between",
              }}
            >
              <MainText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, color: mainTextColor }}
              >
                {p.productNm}
              </MainText>
              <SubText>
                {commaToNum(Number(p.price) + SERVICE_PRICE_PER_PRODUCT)}원
              </SubText>
            </Row>
          </Col>
        </Row>
      ))}
    </FoodlistBox>
  );
};

export default Foodlist;

const FoodlistBox = styled.View`
  margin-top: 40px;
  row-gap: 16px;
`;

const ImageBtn = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

const Thumbnail = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 2px;
`;

const MainText = styled(TextMain)`
  font-size: 12px;
  line-height: 16px;
`;
const SubText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;
