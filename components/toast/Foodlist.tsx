import styled from "styled-components/native";
import { View } from "react-native";
import { ENV, SERVICE_PRICE_PER_PRODUCT } from "@/shared/constants";
import { commaToNum } from "@/shared/utils/sumUp";
import { Icon, Row, TextMain, TextSub } from "@/shared/ui/styledComps";
import { IDietDetailData } from "@/shared/api/types/diet";
import { useAppSelector } from "@/shared/hooks/reduxHooks";
import colors from "@/shared/colors";
import { icons } from "@/shared/iconSource";

const Foodlist = ({ foods }: { foods: IDietDetailData }) => {
  // redux
  const selectedFood = useAppSelector(
    (state) => state.formula.autoAddSelectedFood
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
            </ItemBox>
          ))
        ) : (
          <ItemBox>
            <ThumbnailImg />
          </ItemBox>
        )}
      </CurrentMenuBox>
      {selectedFood && (
        <Row style={{ columnGap: 4 }}>
          <Icon source={icons.plusRoundBlack_32} size={24} />
          <SelectedItemBox>
            <PlatformNm numberOfLines={1} ellipsizeMode="tail">
              {selectedFood?.platformNm}
            </PlatformNm>
            <ThumbnailImg
              source={{ uri: `${ENV.BASE_URL}${selectedFood.mainAttUrl}` }}
              resizeMode="cover"
            />
          </SelectedItemBox>
        </Row>
      )}
    </Grid>
  );
};

export default Foodlist;

const Grid = styled.View`
  margin-top: 24px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 8px;
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
  width: 64px;
  height: 64px;
  border-radius: 5px;
`;
