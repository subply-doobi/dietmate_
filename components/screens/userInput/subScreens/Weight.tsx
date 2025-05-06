// RN, expo
import { TextInput } from "react-native";

// 3rd
import { useDispatch } from "react-redux";
import styled from "styled-components/native";

// doobi
import SquareInput from "@/shared/ui/SquareInput";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useAppSelector } from "@/shared/hooks/reduxHooks";

const Weight = () => {
  // redux
  const dispatch = useDispatch();
  const weight = useAppSelector((state) => state.userInput.weight);

  // useRef
  const weightRef = useRef<TextInput | null>(null);

  // useEffect
  useFocusEffect(
    useCallback(() => {
      weightRef?.current?.focus();
    }, [])
  );

  return (
    <Container>
      <SquareInput
        label="몸무게 (kg)"
        isActive={!!weight.value}
        value={weight.value}
        onChangeText={(v) => dispatch(setValue({ name: "weight", value: v }))}
        errMsg={weight.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder="몸무게를 입력해주세요"
        ref={weightRef}
      />
    </Container>
  );
};

export default Weight;
const Container = styled.View`
  flex: 1;
`;
