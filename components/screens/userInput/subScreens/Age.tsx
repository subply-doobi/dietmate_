// RN, expo
import { useCallback, useEffect, useRef } from "react";
import { TextInput } from "react-native";

// 3rd
import styled from "styled-components/native";

// doobi
import SquareInput from "@/shared/ui/SquareInput";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { useFocusEffect, useNavigation } from "expo-router";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";

const Age = ({ userInputState }: { userInputState: IUserInputState }) => {
  // navigation
  const { isFocused } = useNavigation();

  // redux
  const dispatch = useAppDispatch();
  const { age } = userInputState;

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
