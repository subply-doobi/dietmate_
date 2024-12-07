import { ActivityIndicator } from "react-native";
import { Col, TextMain } from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import styled from "styled-components/native";

const LoadingAlertContent = () => {
  return (
    <Box>
      <AlertText>잠시만 기다려주세요</AlertText>
      <ActivityIndicator size="small" color={colors.main} />
    </Box>
  );
};

export default LoadingAlertContent;
const Box = styled.View`
  justify-content: center;
  align-items: center;
  padding: 28px 0px;
`;

const AlertText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  margin-bottom: 24px;
`;
