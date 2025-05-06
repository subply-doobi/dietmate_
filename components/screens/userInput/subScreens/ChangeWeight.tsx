// RN
import { TextInput } from "react-native";
import { useCallback, useRef } from "react";

// 3rd
import styled from "styled-components/native";

// doobi
import { setValue } from "@/features/reduxSlices/userInputSlice";
import SquareInput from "@/shared/ui/SquareInput";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useFocusEffect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const ChangeWeight = () => {
  // react-qurey
  const { data: baseLineData } = useGetBaseLine();

  // redux
  const dispatch = useAppDispatch();
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
        label={`몸무게 (기존 : ${baseLineData?.weight}kg)`}
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

export default ChangeWeight;

const Container = styled.View`
  flex: 1;
`;
