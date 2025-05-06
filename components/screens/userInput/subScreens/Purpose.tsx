// RN

// 3rd
import styled from "styled-components/native";

// doobi
import { useListCode } from "@/shared/api/queries/code";
import { Col } from "@/shared/ui/styledComps";
import ToggleButton from "@/shared/ui/ToggleButton";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const Purpose = () => {
  // redux
  const dispatch = useAppDispatch();
  const dietPurposeCd = useAppSelector(
    (state) => state.userInput.dietPurposeCd
  );

  // react-query
  const { data: dPCodeData } = useListCode("SP002"); // SP002 : 식단의 목적

  return (
    <Container>
      <Col style={{ rowGap: 8 }}>
        {dPCodeData?.map((item, idx) => (
          <ToggleButton
            key={item.cdNm}
            isActive={dietPurposeCd.value === item.cd}
            label={item.cdNm}
            style={{ width: "100%", height: 48 }}
            onPress={() =>
              dispatch(setValue({ name: "dietPurposeCd", value: item.cd }))
            }
          />
        ))}
      </Col>
    </Container>
  );
};

export default Purpose;

const Container = styled.View``;
