// RN

// 3rd
import styled from "styled-components/native";
import LottieView from "lottie-react-native";

// doobi
import { SCREENHEIGHT, SCREENWIDTH } from "@/shared/constants";

const Start = () => {
  return (
    <Container>
      <LottieView
        source={require("@/shared/assets/onboardingLottie/onboardingCr.json")}
        style={{
          width: SCREENWIDTH - 32,
          height: SCREENHEIGHT - 32 - 104 - 64 - 24 - 96 - 120 - 52 - 40 - 40,
        }}
        autoPlay
        loop
      />
    </Container>
  );
};

export default Start;

const Container = styled.View``;
