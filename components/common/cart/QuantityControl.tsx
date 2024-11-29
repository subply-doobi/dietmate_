import { SetStateAction } from "react";
import styled from "styled-components/native";

import { icons } from "@/shared/iconSource";
import { TextMain } from "@/shared/ui/styledComps";
import { IDietDetailProductData } from "@/shared/api/types/diet";

const QuantityControl = ({
  food,
  setNumberPickerShow,
  setNumberPickerInfo,
}: {
  food: IDietDetailProductData;
  setNumberPickerShow: React.Dispatch<SetStateAction<boolean>>;
  setNumberPickerInfo: React.Dispatch<SetStateAction<any>>;
}) => {
  return (
    <QuantityControlBox
      onPress={() => {
        setNumberPickerInfo({
          platformNm: food.platformNm,
          productNo: food.productNo,
          productNm: food.productNm,
          price: food.price,
          minQty: food.minQty,
          freeShippingPrice: food.freeShippingPrice,
          shippingPrice: food.shippingPrice,
        });
        setNumberPickerShow(true);
      }}
    >
      <PlusMinusBtn>
        <PlusMinusImage source={icons.numberMinus_12} />
      </PlusMinusBtn>
      <Quantity>{food.qty}</Quantity>
      <PlusMinusBtn>
        <PlusMinusImage source={icons.numberPlus_12} />
      </PlusMinusBtn>
    </QuantityControlBox>
  );
};

export default QuantityControl;

const QuantityControlBox = styled.TouchableOpacity`
  flex-direction: row;
  width: 98px;
  align-items: center;
  justify-content: space-between;
`;

const Quantity = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
`;

const PlusMinusBtn = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;
const PlusMinusImage = styled.Image`
  width: 12px;
  height: 12px;
`;
