import RangeBtn from "./RangeBtn";
import { FILTER_BTN_RANGE } from "@/shared/constants";
import styled from "styled-components/native";

const PriceFilter = () => {
  return (
    <Container>
      <RangeBtn btn={FILTER_BTN_RANGE[4]} btnIdx={4} />
    </Container>
  );
};

export default PriceFilter;

const Container = styled.View`
  margin-top: 48px;
`;
