// 3rd
import styled from "styled-components/native";

// doobi
import { Col } from "@/shared/ui/styledComps";
import { useListCode } from "@/shared/api/queries/code";
import ToggleButton from "@/shared/ui/ToggleButton";
import { SCREENWIDTH } from "@/shared/constants";
import {
  IUserInputState,
  setValue,
} from "@/features/reduxSlices/userInputSlice";
import DTooltip from "@/shared/ui/DTooltip";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";

const WOFrequency = ({
  userInputState,
}: {
  userInputState: IUserInputState;
}) => {
  // redux
  const dispatch = useAppDispatch();
  const { sportsSeqCd } = userInputState;

  // react-query
  const { data: seqCode } = useListCode("SP008"); // SP008 : 운동빈도 (sportsSeqCd)

  // 툴팁 텍스트
  const seqTooltipText = seqCode
    ? seqCode.findIndex((item) => item.cd === sportsSeqCd.value) < 3
      ? "두비는 주 3회 이상 운동을 권장합니다"
      : seqCode?.findIndex((item) => item.cd === sportsSeqCd.value) === 7
      ? "두비는 헬창을 응원합니다"
      : ""
    : "";

  return (
    <Container>
      <Col style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {seqCode?.map((item, idx) => (
          <ToggleButton
            key={item.cdNm}
            isActive={sportsSeqCd.value === item.cd}
            label={item.cd !== "SP008008" ? item.cdNm : "7회"}
            style={{ width: (SCREENWIDTH - 32 - 8 - 8 - 8) / 4, height: 48 }}
            onPress={() =>
              dispatch(setValue({ name: "sportsSeqCd", value: item.cd }))
            }
          />
        ))}
        {/* 주간 운동횟수 툴팁 */}
        <Col>
          <DTooltip
            tooltipShow={!!seqTooltipText}
            boxTop={8}
            boxLeft={0}
            triangle={false}
            text={seqTooltipText}
          />
        </Col>
      </Col>
    </Container>
  );
};

export default WOFrequency;

const Container = styled.View``;
