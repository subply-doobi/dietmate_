// RN, expo
import { useFocusEffect, useNavigation } from "expo-router";

// 3rd
import styled from "styled-components/native";

// doobi
import SquareInput from "@/shared/ui/SquareInput";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { useCallback, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";

const Height = ({ userInputState }: { userInputState: IUserInputState }) => {
  // navigation
  const { isFocused } = useNavigation();

  // redux
  const dispatch = useAppDispatch();
  const { height } = userInputState;

  // useRef
  const heightRef = useRef<TextInput | null>(null);

  // useEffect
  useFocusEffect(
    useCallback(() => {
      heightRef?.current?.focus();
    }, [])
  );

  return (
    <Container>
      <SquareInput
        label="신장 (cm)"
        isActive={!!height.value}
        value={height.value}
        onChangeText={(v) => dispatch(setValue({ name: "height", value: v }))}
        errMsg={height.errMsg}
        keyboardType="numeric"
        maxLength={3}
        placeholder="신장을 입력해주세요"
        ref={heightRef}
      />
    </Container>
  );
};

export default Height;

const Container = styled.View`
  flex: 1;
`;
