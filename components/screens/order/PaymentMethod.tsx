// RN

// 3rd
import styled from "styled-components/native";

// doobi
import colors from "@/shared/colors";
import {
  AccordionContentContainer,
  BtnCTA,
  HorizontalSpace,
  Icon,
  Row,
  TextMain,
} from "@/shared/ui/styledComps";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { PAY_METHOD } from "@/shared/utils/screens/order/payConsts";

const PaymentMethod = () => {
  // redux
  const { paymentMethod, pg } = useAppSelector(
    (rootstate) => rootstate.userInput
  );
  const dispatch = useAppDispatch();

  const currentMethodItem = PAY_METHOD.find(
    (item) => item.value === paymentMethod.value
  );
  return (
    <AccordionContentContainer>
      <Row style={{ columnGap: 8 }}>
        {PAY_METHOD.map((method) => {
          const isActive = paymentMethod.value === method.value;
          const backgroundColor = isActive ? colors.dark : colors.white;
          const borderWidth = isActive ? 0 : 1;
          const borderColor = isActive ? colors.dark : colors.inactive;
          const textColor = isActive ? colors.white : colors.textSub;
          return (
            <MethodBtn
              key={method.value}
              style={{
                backgroundColor,
                borderWidth,
                borderColor,
              }}
              onPressIn={() => {
                dispatch(
                  setValue({ name: "paymentMethod", value: method.value })
                );
                dispatch(setValue({ name: "pg", value: method.pg[0].value }));
              }}
            >
              <Row>
                <MethodBtnText style={{ color: textColor }}>
                  {method.label}
                </MethodBtnText>
              </Row>
            </MethodBtn>
          );
        })}
      </Row>
      <HorizontalSpace height={16} />
      <Row style={{ columnGap: 8 }}>
        {currentMethodItem?.subBtn &&
          currentMethodItem.pg.map((item) => {
            const isActive = item.value === pg.value;
            const backgroundColor = item.btnActiveBg;
            const borderWidth = isActive ? 0 : 1;
            const borderColor = colors.lineLight;
            const color = item.textColor;
            const opacity = isActive ? 1 : 0.5;
            const iconSize = item.iconSize;
            return (
              <MethodBtn
                key={item.value}
                style={{ backgroundColor, borderColor, borderWidth, opacity }}
                onPress={() =>
                  dispatch(setValue({ name: "pg", value: item.value }))
                }
              >
                {item.iconSource && (
                  <Icon
                    source={item.iconSource}
                    resizeMode="contain"
                    size={iconSize}
                  />
                )}
                <MethodBtnText style={{ color }}>{item.label}</MethodBtnText>
              </MethodBtn>
            );
          })}
      </Row>

      <GuideText>
        다른 결제수단은 <BoldText>정식출시</BoldText>를 조금만 기다려주세요
      </GuideText>
    </AccordionContentContainer>
  );
};

export default PaymentMethod;

const MethodBtn = styled.TouchableOpacity`
  flex-direction: row;
  flex: 1;
  height: 48px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  column-gap: 8px;
`;

const MethodBtnText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
`;

const GuideText = styled(TextMain)`
  margin-top: 16px;
  font-size: 14px;
  font-weight: 300;
`;
const BoldText = styled(TextMain)`
  font-size: 14px;
  font-weight: 800;
`;
