import colors from "@/shared/colors";
import { MENU_LABEL } from "@/shared/constants";
import {
  showFoodChangeToast,
  showQtyChangeToast,
} from "@/shared/store/toastStore";
import CtaButton from "@/shared/ui/CtaButton";
import { Row, TextMain } from "@/shared/ui/styledComps";
import styled from "styled-components/native";
import Foodlist from "./Foodlist";
import { MenuWithChangeAvailableFoods } from "@/shared/utils/screens/lowerShipping/changeAvailable";

interface IMenuToMod {
  menuArr?: MenuWithChangeAvailableFoods[];
  type: "qtyOnly" | "foodOnly" | "qtyRecommended" | "both";
}
const MenuToMod = ({ menuArr, type }: IMenuToMod) => {
  if (!menuArr || menuArr.length === 0) return null;

  return (
    <Container>
      {menuArr?.map((menu, index) => (
        <Card
          key={index}
          style={{ boxShadow: "1px 1px 5px rgba(0, 0, 0, 0.12)" }}
        >
          <Row style={{ justifyContent: "center" }}>
            <CardTitle>{MENU_LABEL[menu.index]}</CardTitle>
            {Number(menu.dietDetailData[0]?.qty) > 1 && (
              <CardSubTitle style={{ marginLeft: 8 }}>
                ( x{menu.dietDetailData[0]?.qty} )
              </CardSubTitle>
            )}
            {/* <CardTitle style={{ position: "absolute", right: 0 }}>
              {commaToNum(menu.currentDietPrice)}원
            </CardTitle> */}
          </Row>

          {/* 식품 리스트 */}
          <Foodlist dDData={menu.dietDetailData} />

          {/* 식품 || 근수 변경 버튼 */}
          <BtnRow>
            {type !== "qtyOnly" && (
              <CtaButton
                btnStyle={type === "foodOnly" ? "borderActive" : "border"}
                style={{ flex: 1, height: 48 }}
                btnText="식품 변경"
                onPress={() =>
                  showFoodChangeToast({ menuWithChangeAvailableFoods: menu })
                }
              />
            )}
            {type !== "foodOnly" && (
              <CtaButton
                btnStyle={type === "qtyRecommended" ? "borderActive" : "border"}
                btnTextStyle={{ color: colors.textSub }}
                style={{ flex: 1, height: 48 }}
                btnText="근수 변경"
                onPress={() => showQtyChangeToast({ menuIdx: menu.index })}
              />
            )}
          </BtnRow>
        </Card>
      ))}
    </Container>
  );
};

export default MenuToMod;

const Container = styled.View`
  width: 99%;
  margin-top: 24px;
  row-gap: 40px;
`;

const Card = styled.View`
  width: 100%;
  padding: 24px;
  background-color: ${colors.white};
  border-radius: 6px;
  border-width: 1px;
  border-color: ${colors.lineLight};
`;
const CardTitle = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: bold;
`;
const CardSubTitle = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.textSub};
`;

const BtnRow = styled(Row)`
  width: 100%;
  margin-top: 40px;
  justify-content: space-between;
  column-gap: 8px;
`;
