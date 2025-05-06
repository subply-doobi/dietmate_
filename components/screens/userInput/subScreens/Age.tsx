// RN, expo
import { useCallback, useRef } from "react";
import { TextInput } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import SquareInput from "@/shared/ui/SquareInput";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { useFocusEffect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const Age = () => {
  // redux
  const dispatch = useAppDispatch();
  const age = useAppSelector((state) => state.userInput.age);

  // useRef
  const ageRef = useRef<TextInput | null>(null);

  // useEffect
  useFocusEffect(
    useCallback(() => {
      ageRef?.current?.focus();
    }, [])
  );

  return (
    <Container>
      <SquareInput
        label="만 나이"
        isActive={!!age.value}
        value={age.value}
        onChangeText={(v) => dispatch(setValue({ name: "age", value: v }))}
        errMsg={age.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder="만 나이를 입력해주세요"
        ref={ageRef}
      />
    </Container>
  );
};

export default Age;

const Container = styled.View`
  flex: 1;
`;
