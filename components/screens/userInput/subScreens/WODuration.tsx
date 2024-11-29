// 3rd

// doobi
import styled from "styled-components/native";
import { useListCode } from "@/shared/api/queries/code";
import ToggleButton from "@/shared/ui/ToggleButton";
import { SCREENWIDTH } from "@/shared/constants";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import { Col } from "@/shared/ui/styledComps";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

const cdToLabel: { [key: string]: string } = {
  SP009001: "~30분 ",
  SP009002: "~60분 ",
  SP009003: "~90분 ",
  SP009004: "~120분 ",
  SP009005: "120분~",
};

const WODuration = ({
  userInputState,
}: {
  userInputState: IUserInputState;
}) => {
  // redux
  const dispatch = useAppDispatch();
  const { sportsTimeCd } = useAppSelector((state) => state.userInput);

  // react-query
  const { data: timeCode } = useListCode("SP009"); // SP009 : 운동시간 (sportsTimeCd)

  return (
    <Container>
      <Col style={{ flex: 1, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {timeCode?.map((item, idx) => (
          <ToggleButton
            key={item.cdNm}
            isActive={sportsTimeCd.value === item.cd}
            label={cdToLabel[item.cd]}
            style={{ width: (SCREENWIDTH - 32 - 8 - 8 - 8) / 4, height: 48 }}
            onPress={() =>
              dispatch(setValue({ name: "sportsTimeCd", value: item.cd }))
            }
          />
        ))}
      </Col>
    </Container>
  );
};

export default WODuration;

const Container = styled.View``;
