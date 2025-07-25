// RN, expo
import { useRouter } from "expo-router";

// 3rd
import styled from "styled-components/native";

// doobi
import { navigateByUserInfo } from "@/shared/utils/screens/login/navigateByUserInfo";
import { useGetGuestYn } from "@/shared/api/queries/guest";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import colors from "@/shared/colors";
import { ILoginType, useLoginByType } from "@/shared/api/queries/login";
import { ENV, IS_ANDROID, IS_IOS, SCREENWIDTH } from "@/shared/constants";
import AppleLogin from "@/components/screens/login/AppleLogin";
import {
  BtnCTA,
  BtnText,
  Col,
  Container,
  TextMain,
} from "@/shared/ui/styledComps";
import { useEffect, useState } from "react";
import { getKeyHashAndroid } from "@react-native-kakao/core";

const Login = () => {
  // navigation
  const router = useRouter();

  // react-query
  const { data: guestYnData } = useGetGuestYn();
  const { data: baseLineData, refetch: refetchBaseLine } = useGetBaseLine({
    enabled: false,
  });
  const loginByTypeMutation = useLoginByType();

  // kakaoLogin || guest login (플레이스토어, 앱스토어, 카드사 심사용: 서버 값으로 사용유무 결정)
  const signIn = async (option: ILoginType): Promise<void> => {
    const res = await loginByTypeMutation.mutateAsync({ type: option });
    if (!res) return;
    if (baseLineData) {
      baseLineData && navigateByUserInfo(baseLineData, router);
      return;
    }
    const newBLData = await refetchBaseLine().then((res) => res.data);
    navigateByUserInfo(newBLData, router);
  };

  // android key hash test
  const [keyHash, setKeyHash] = useState<string>("");
  useEffect(() => {
    if (!IS_ANDROID) return;
    const getKeyHash = async () => {
      const hash = await getKeyHashAndroid();
      setKeyHash(hash ?? "");
    };
    getKeyHash();
  }, []);

  return (
    <Container style={{ paddingHorizontal: 16 }}>
      {ENV.APP_VARIANT !== "production" && (
        <Col style={{ marginTop: 40, alignSelf: "center" }}>
          <TestTxt selectable={true}>
            {ENV.APP_VARIANT} | keyHash: {keyHash}
          </TestTxt>
        </Col>
      )}
      <BtnBox>
        <BtnKakaoLogin btnStyle="kakao" onPress={() => signIn("kakao")}>
          <BtnTextKakao>카카오 로그인</BtnTextKakao>
        </BtnKakaoLogin>

        {/* 앱심사용 게스트로그인 사용유무 */}
        {guestYnData && guestYnData.enableYn === "Y" && (
          <BtnGuestLogin onPress={() => signIn("guest")}>
            <BtnTextGuest>Guest Login </BtnTextGuest>
          </BtnGuestLogin>
        )}

        {IS_IOS && guestYnData && guestYnData.enableYn === "Y" && (
          <AppleLogin />
        )}
      </BtnBox>
      <LogoBox>
        <Logo
          resizeMode="contain"
          source={require("../shared/assets/appIcon/appIcon_withT.png")}
        />
      </LogoBox>
    </Container>
  );
};

export default Login;

const TestTxt = styled(TextMain)`
  font-size: 14px;
  text-align: center;
`;

const BtnBox = styled.View`
  width: 100%;
  position: absolute;
  bottom: 70px;
  align-self: center;
`;

const LogoBox = styled.View`
  position: absolute;
  top: 40%;
  width: ${SCREENWIDTH * 0.3}px;
  height: ${SCREENWIDTH * 0.3}px;
  align-self: center;
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
  border-radius: 30px;
`;

const Logo = styled.Image`
  width: 100%;
  height: 100%;
`;

const BtnKakaoLogin = styled(BtnCTA)`
  align-self: center;
`;

const BtnTextKakao = styled(BtnText)`
  color: ${colors.textMain};
`;

const BtnGuestLogin = styled(BtnCTA)`
  align-self: center;
  margin-top: 20px;
  background-color: ${colors.backgroundLight2};
`;

const BtnTextGuest = styled(BtnText)`
  color: ${colors.textMain};
`;
