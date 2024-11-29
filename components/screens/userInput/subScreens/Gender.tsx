// RN

// 3rd
import styled from "styled-components/native";

// doobi
import { Row } from "@/shared/ui/styledComps";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import ToggleButton from "@/shared/ui/ToggleButton";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";

const genderBtnItem = [
  { label: "남성", value: "M" },
  { label: "여성", value: "F" },
];
const Gender = ({ userInputState }: { userInputState: IUserInputState }) => {
  // redux
  const dispatch = useAppDispatch();
  const { gender } = userInputState;
  return (
    <Container>
      <Row
        style={{
          width: "100%",
          alignItems: "flex-start",
          justifyContent: "space-between",
          columnGap: 8,
        }}
      >
        {genderBtnItem.map((item, index) => (
          <ToggleButton
            key={index}
            label={item.label}
            isActive={gender.value === item.value}
            style={{ flex: 1 }}
            onPress={() =>
              dispatch(setValue({ name: "gender", value: item.value }))
            }
          ></ToggleButton>
        ))}
      </Row>
    </Container>
  );
};

export default Gender;

const Container = styled.View``;
