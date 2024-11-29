// 3rd
import styled from "styled-components/native";

// doobi
import { Col } from "@/shared/ui/styledComps";
import { useListCode } from "@/shared/api/queries/code";
import ToggleButton from "@/shared/ui/ToggleButton";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const WOIntensity = ({
  userInputState,
}: {
  userInputState: IUserInputState;
}) => {
  // redux
  const dispatch = useAppDispatch();
  const { sportsStrengthCd } = useAppSelector((state) => state.userInput);

  // react-query
  const { data: strengthCode } = useListCode("SP010"); // SP010 : 운동강도 (sportsStrengthCd)

  return (
    <Container>
      <Col style={{ rowGap: 8 }}>
        {strengthCode?.map((item, idx) => (
          <ToggleButton
            key={item.cdNm}
            isActive={sportsStrengthCd.value === item.cd}
            label={item.cdNm}
            style={{ width: "100%", height: 48 }}
            onPress={() =>
              dispatch(setValue({ name: "sportsStrengthCd", value: item.cd }))
            }
          />
        ))}
      </Col>
    </Container>
  );
};

export default WOIntensity;

const Container = styled.View``;
