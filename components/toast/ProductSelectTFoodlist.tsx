import styled from "styled-components/native";
import { View } from "react-native";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { commaToNum } from "@/shared/utils/sumUp";
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { IDietDetailData } from "@/shared/api/types/diet";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";

const ProductSelectFoodlist = ({ foods }: { foods: IDietDetailData }) => {
  // redux
  const autoAddFoodForAdd = useAppSelector(
    (state) => state.formula.autoAddFoodForAdd
  );
  const autoAddFoodForChange = useAppSelector(
    (state) => state.formula.autoAddFoodForChange
  );

  return (
    <Grid>
      <CurrentMenuBox>
        {foods.length ? (
          foods.map((f) => (
            <ItemBox key={f.productNo}>
              <PlatformNm numberOfLines={1} ellipsizeMode="tail">
                {f.platformNm}
              </PlatformNm>
              <ThumbnailImg
                source={{ uri: `${ENV.BASE_URL}${f.mainAttUrl}` }}
                resizeMode="cover"
              />
              {f.productNo === autoAddFoodForChange?.productNo && (
                <OpacityBox>
                  <OpacityText>교체</OpacityText>
                </OpacityBox>
              )}
            </ItemBox>
          ))
        ) : (
          <ItemBox>
            <ThumbnailImg />
          </ItemBox>
        )}
      </CurrentMenuBox>
      {autoAddFoodForAdd && (
        <Row style={{ columnGap: 4 }}>
          <Icon source={icons.plusRoundBlack_32} size={24} />
          <SelectedItemBox>
            <PlatformNm numberOfLines={1} ellipsizeMode="tail">
              {autoAddFoodForAdd?.platformNm}
            </PlatformNm>
            <ThumbnailImg
              source={{ uri: `${ENV.BASE_URL}${autoAddFoodForAdd.mainAttUrl}` }}
              resizeMode="cover"
            />
          </SelectedItemBox>
        </Row>
      )}
    </Grid>
  );
};

export default ProductSelectFoodlist;

const Grid = styled.View`
  margin-top: 24px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 8px 0;
  column-gap: 4px;
`;

const CurrentMenuBox = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 6px;
  border-width: 1px;
  border-color: ${colors.whiteOpacity30};
  padding: 8px;
  gap: 8px;
`;

const OpacityBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  border-radius: 4px;
  background-color: ${colors.blackOpacity50};
  align-items: center;
  justify-content: center;
`;

const OpacityText = styled(TextSub)`
  color: ${colors.white};
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
`;

const ItemBox = styled.View`
  align-items: center;
`;
const SelectedItemBox = styled.View`
  align-items: center;
`;

const PlatformNm = styled(TextSub)`
  font-size: 11px;
  line-height: 14px;
  align-self: flex-start;
`;

const ThumbnailImg = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 5px;
`;
