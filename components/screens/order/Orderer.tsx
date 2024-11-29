import { useRef } from "react";
import {
  AccordionContentContainer,
  HorizontalSpace,
} from "@/shared/ui/styledComps";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import SquareInput from "@/shared/ui/SquareInput";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const Orderer = () => {
  const dispatch = useAppDispatch();
  const { buyerName, buyerTel } = useAppSelector((state) => state.userInput);

  type SquareInputRef = React.ElementRef<typeof SquareInput>;
  const inputRefArr = useRef<Array<SquareInputRef | null>>([]);
  return (
    <AccordionContentContainer style={{ paddingBottom: 48 }}>
      {/* orderer */}
      <SquareInput
        // boxStyle={{backgroundColor: 'red'}}
        label="주문자"
        isActive={!!buyerName.value}
        value={buyerName.value}
        onChangeText={(v) =>
          dispatch(setValue({ name: "buyerName", value: v }))
        }
        errMsg={buyerName.errMsg}
        keyboardType="default"
        placeholder="이름"
        ref={(el) => (inputRefArr.current[0] = el)}
        onSubmitEditing={() => inputRefArr.current[1]?.focus()}
      />
      <HorizontalSpace height={8} />

      {/* ordererContact */}
      <SquareInput
        label="휴대전화"
        isActive={!!buyerTel.value}
        value={buyerTel.value}
        onChangeText={(v) => dispatch(setValue({ name: "buyerTel", value: v }))}
        errMsg={buyerTel.errMsg}
        keyboardType="number-pad"
        maxLength={13}
        placeholder="휴대전화"
        ref={(el) => (inputRefArr.current[1] = el)}
      />
    </AccordionContentContainer>
  );
};

export default Orderer;
