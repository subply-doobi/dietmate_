import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { IProductData } from "@/shared/api/types/product";
import styled from "styled-components/native";
import { icons } from "@/shared/iconSource";
import { commaToNum } from "@/shared/utils/sumUp";
import colors from "@/shared/colors";
import { ENV } from "@/shared/constants";

interface IChangeSummary {
  foodToChange: IProductData;
  selectedProduct: IProductData | undefined;
}
const ChangeSummary = ({ foodToChange, selectedProduct }: IChangeSummary) => {
  const nutrOriginal = [
    {
      name: "칼로리",
      value: parseInt(foodToChange?.calorie, 10),
      unit: "kcal",
    },
    { name: "탄수화물", value: parseInt(foodToChange?.carb, 10), unit: "g" },
    { name: "단백질", value: parseInt(foodToChange?.protein, 10), unit: "g" },
    { name: "지방", value: parseInt(foodToChange?.fat, 10), unit: "g" },
  ];

  const nutrChanged = !selectedProduct
    ? []
    : [
        {
          name: "칼로리",
          value: parseInt(selectedProduct?.calorie, 10),
          unit: "kcal",
        },
        {
          name: "탄수화물",
          value: parseInt(selectedProduct?.carb, 10),
          unit: "g",
        },
        {
          name: "단백질",
          value: parseInt(selectedProduct?.protein, 10),
          unit: "g",
        },
        { name: "지방", value: parseInt(selectedProduct?.fat, 10), unit: "g" },
      ];

  const nutrDiff = !selectedProduct
    ? []
    : nutrOriginal.map((item, index) => {
        return {
          value: nutrChanged[index].value - item.value,
          unit: nutrOriginal[index].unit,
        };
      });

  return (
    <Container>
      <Row style={{ columnGap: 24 }}>
        <Box>
          <Thumbnail
            source={{
              uri: `${ENV.BASE_URL}${foodToChange.mainAttUrl}`,
            }}
            resizeMode="cover"
          />
          <PlatformNm>{foodToChange?.platformNm}</PlatformNm>
          <NmAndPrice numberOfLines={2} ellipsizeMode="tail">
            {foodToChange?.productNm}
          </NmAndPrice>
          <NmAndPrice style={{ marginTop: 2, textAlign: "right" }}>
            {commaToNum(foodToChange?.price)}원
          </NmAndPrice>
        </Box>
        <Icon source={icons.arrowRight_20} />
        {!selectedProduct ? (
          <Box
            style={{
              borderColor: colors.lineLight,
              borderWidth: 2,
              borderRadius: 5,
            }}
          >
            <Icon source={icons.changeLine_24} />
          </Box>
        ) : (
          <Box>
            <Thumbnail
              source={{
                uri: `${ENV.BASE_URL}${selectedProduct.mainAttUrl}`,
              }}
              resizeMode="cover"
            />
            <PlatformNm>{selectedProduct?.platformNm}</PlatformNm>
            <NmAndPrice numberOfLines={2} ellipsizeMode="tail">
              {selectedProduct?.productNm}
            </NmAndPrice>
            <NmAndPrice style={{ marginTop: 2, textAlign: "right" }}>
              {commaToNum(selectedProduct?.price)}원
            </NmAndPrice>
          </Box>
        )}
      </Row>

      <NutrBox>
        {/* 기존 nutr */}
        <Row style={{ width: "100%" }}>
          {nutrOriginal.map((v) => (
            <Row
              key={v.name}
              style={{
                flex: 1,
              }}
            >
              <NutrNm>
                {v.name}{" "}
                <NutrValue>
                  {v.value}
                  {v.unit}
                </NutrValue>
              </NutrNm>
            </Row>
          ))}
        </Row>
        {/* 변화량 */}
        <Row>
          {nutrDiff.map((v, index) => (
            <Row
              key={index}
              style={{
                flex: 1,
              }}
            >
              <Row style={{ flex: 1, justifyContent: "center" }}>
                {v.value !== 0 && (
                  <Icon
                    size={8}
                    source={
                      v.value < 0
                        ? icons.down_8
                        : v.value === 0
                        ? icons.round_8
                        : icons.up_8
                    }
                  />
                )}
                <NutrValue style={{ marginLeft: 4 }}>{v.value}</NutrValue>
              </Row>
            </Row>
          ))}
        </Row>
        {/* 바뀐 nutr */}
        <Row>
          {nutrChanged.map((v) => (
            <Row
              key={v.name}
              style={{
                flex: 1,
              }}
            >
              <NutrNm>
                {v.name}{" "}
                <NutrValue>
                  {v.value}
                  {v.unit}
                </NutrValue>
              </NutrNm>
            </Row>
          ))}
        </Row>
      </NutrBox>
    </Container>
  );
};

export default ChangeSummary;

const Container = styled.View`
  width: 100%;
  height: 272px;
  margin-top: 24px;
  align-items: center;
`;

const Box = styled.View`
  width: 104px;
  height: 172px;
  align-items: center;
  justify-content: center;
`;

const Thumbnail = styled.Image`
  width: 104px;
  height: 104px;
  border-radius: 5px;
`;

const PlatformNm = styled(TextSub)`
  width: 104px;
  font-size: 11px;
  margin-top: 4px;
  line-height: 16px;
`;

const NmAndPrice = styled(TextMain)`
  width: 104px;
  font-size: 11px;
  line-height: 16px;
`;

const NutrBox = styled.View`
  width: 100%;
  height: 88px;
  background-color: ${colors.backgroundLight};
  margin-top: 24px;
  padding: 16px 16px;
  row-gap: 4px;
`;

const NutrNm = styled(TextSub)`
  width: 100%;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
`;
const NutrValue = styled(TextMain)`
  font-size: 11px;
  line-height: 16px;
`;
