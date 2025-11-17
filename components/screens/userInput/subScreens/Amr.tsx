// RN
import { RefObject, useRef } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { Col } from "@/shared/ui/styledComps";
import SquareInput from "@/shared/ui/SquareInput";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";
import { ScrollView } from "react-native";

interface IAmr {
  scrollRef: RefObject<ScrollView | null>;
}
const Amr = ({ scrollRef }: IAmr) => {
  // redux
  const dispatch = useAppDispatch();
  const amrKnown = useAppSelector((state) => state.userInput.amrKnown);
  const bmrKnown = useAppSelector((state) => state.userInput.bmrKnown);
  // useRef
  const inputRef = useRef([]);

  return (
    <Container>
      <Col style={{ flex: 1 }}>
        <SquareInput
          isActive={!!bmrKnown.value}
          label="기초대사량 (kcal)"
          value={bmrKnown.value}
          onChangeText={(v) =>
            dispatch(setValue({ name: "bmrKnown", value: v }))
          }
          errMsg={bmrKnown.errMsg}
          keyboardType="numeric"
          maxLength={4}
          placeholder="기초대사량을 입력해주세요 (선택사항)"
          onSubmitEditing={() => inputRef.current[0]?.focus()}
          onFocus={() => scrollRef?.current?.scrollToEnd({ animated: true })}
        />
        <SquareInput
          isActive={!!amrKnown.value}
          label="운동 소모 칼로리 (kcal)"
          value={amrKnown.value}
          onChangeText={(v) =>
            dispatch(setValue({ name: "amrKnown", value: v }))
          }
          errMsg={amrKnown.errMsg}
          keyboardType="numeric"
          maxLength={4}
          placeholder="운동으로 소모하는 칼로리 (선택사항)"
          boxStyle={{ marginTop: 4 }}
          ref={(el) => {
            inputRef ? (inputRef.current[0] = el) : null;
          }}
          onFocus={() =>
            setTimeout(() => {
              scrollRef?.current?.scrollToEnd({ animated: true });
            }, 150)
          }
        />
      </Col>
    </Container>
  );
};

export default Amr;

const Container = styled.View`
  flex: 1;
`;
