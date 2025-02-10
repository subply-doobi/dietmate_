// 3rd
import styled from "styled-components/native";
import RNRestart from "react-native-restart";

// doobi
import { icons } from "@/shared/iconSource";
import {
  Col,
  Container,
  Icon,
  TextMain,
  TextSub,
} from "@/shared/ui/styledComps";
import colors from "@/shared/colors";
import { useLocalSearchParams } from "expo-router";
import { Alert, ScrollView } from "react-native";
import { useEffect } from "react";
import { ENV } from "@/shared/constants";

// 1. app splash 에서 버전 확인할 때 서버오류
// 2. 로그인시 서버오류
// 3. 일반 404 오류일 때 ErrorPage 띄우기
// (나머지는 commonAlert로 처리)
const ErrorPage = () => {
  const params = useLocalSearchParams();
  console.log("ErrorPage: params: ", params);

  const errorCode = Number(params.errorCode);
  const msg = params.msg;

  const subText =
    errorCode === null ? "잠시 후 다시 시도해주세요" : `code: ${errorCode}`;

  const ENVString = JSON.stringify(ENV, null, 2);
  useEffect(() => {
    Alert.alert("Env Var check", JSON.stringify(ENVString, null, 2), [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "OK" },
    ]);
  }, []);
  return (
    <Container style={{ alignItems: "center", justifyContent: "center" }}>
      <ScrollView>
        <Col style={{ alignItems: "center" }}>
          <Icon source={icons.networkError_80} size={64} />
          <ErrorText>{msg}</ErrorText>
          <Sub>{subText}</Sub>
          <Sub>{ENVString}</Sub>
          <RestartBtn onPress={() => RNRestart.restart()}>
            <Icon source={icons.initialize_24} />
            <RestartText>재시작</RestartText>
          </RestartBtn>
        </Col>
      </ScrollView>
    </Container>
  );
};

export default ErrorPage;

const ErrorText = styled(TextMain)`
  font-size: 20px;
  margin-top: 40px;
  font-weight: bold;
  text-align: center;
  line-height: 28px;
`;
const Sub = styled(TextSub)`
  font-size: 16px;
  margin-top: 16px;
  line-height: 20px;
`;

const RestartBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: 40px;
  padding: 8px 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${colors.line};
`;

const RestartText = styled(TextSub)`
  font-size: 16px;
  margin-left: 4px;
  line-height: 22px;
`;
