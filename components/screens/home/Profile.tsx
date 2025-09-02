import {
  Row,
  HorizontalSpace,
  TextMain,
  TextSub,
  Col,
} from "@/shared/ui/styledComps";
import NutrTarget from "./NutrTarget";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import { useGetBaseLine } from "@/shared/api/queries/baseLine";
import { useRouter } from "expo-router";
import Icon from "@/shared/ui/Icon";

const Profile = () => {
  // navigation
  const router = useRouter();

  // react-query
  const { data: baseLineData } = useGetBaseLine();

  return (
    <ProfileBox>
      <Row style={{ paddingHorizontal: 16, columnGap: 8 }}>
        <Col style={{ flex: 1 }}>
          <Row>
            <Nickname>{baseLineData?.nickNm}</Nickname>
            <Nickname style={{ fontWeight: "normal" }}>님</Nickname>
          </Row>
          <SubText style={{ marginTop: 2 }}>
            근의공식이 즐거운 식단실천을 응원합니다
          </SubText>
        </Col>
        <MypageBtn onPress={() => router.push("/Mypage")}>
          <Icon
            name="account_mp"
            boxSize={36}
            iconSize={32}
            color={colors.textSub}
          />
        </MypageBtn>
      </Row>
      <HighlightBox>
        <MainText>한 끼 목표 영양</MainText>
        <TargetChangeBtn
          onPress={() =>
            router.push({ pathname: "/UserInput", params: { from: "NewHome" } })
          }
        >
          <SubText>목표변경</SubText>
          <Icon name="chevronRight" iconSize={20} />
        </TargetChangeBtn>
      </HighlightBox>
      <HorizontalSpace height={16} />
      {baseLineData && (
        <NutrBtn
          onPress={() =>
            router.push({ pathname: "/UserInput", params: { from: "NewHome" } })
          }
        >
          <NutrTarget baseLineData={baseLineData} />
        </NutrBtn>
      )}
    </ProfileBox>
  );
};

export default Profile;

const ProfileBox = styled.View`
  padding: 24px 0px;
  background-color: ${colors.white};
`;

const Nickname = styled(TextMain)`
  font-size: 20px;
  font-weight: bold;
  line-height: 24px;
`;

const MypageBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
`;

const SubText = styled(TextSub)`
  font-size: 12px;
  line-height: 16px;
`;
const MainText = styled(TextMain)`
  font-size: 14px;
  line-height: 20px;
`;

const HighlightBox = styled.View`
  flex-direction: row;
  width: 100%;
  height: 32px;
  background-color: ${colors.highlight};
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 0px 16px;
`;

const NutrBtn = styled.TouchableOpacity``;

const TargetChangeBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;
