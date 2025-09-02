import { resetSortFilter } from "@/features/reduxSlices/filteredPSlice";
import colors from "@/shared/colors";
import { useAppDispatch } from "@/shared/hooks/reduxHooks";
import Icon from "@/shared/ui/Icon";
import { Col, TextSub } from "@/shared/ui/styledComps";
import styled from "styled-components/native";

const ListEmptyComponent = () => {
  // redux
  const dispatch = useAppDispatch();
  return (
    <Box onPress={() => dispatch(resetSortFilter("availableFoods"))}>
      <Col>
        <Text>해당하는 식품이 없어요</Text>
      </Col>
      <Icon name="refresh" color={colors.textSub} />
    </Box>
  );
};

export default ListEmptyComponent;

const Box = styled.TouchableOpacity`
  flex-direction: row;
  width: 100%;
  height: 64px;
  border-width: 1px;
  border-color: ${colors.lineLight};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  column-gap: 8px;
`;

const Text = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
`;
