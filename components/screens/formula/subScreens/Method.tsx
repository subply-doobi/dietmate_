import styled from "styled-components/native";
import SelectBtn from "../SelectBtn";
import { icons } from "@/shared/iconSource";
import { SetStateAction } from "react";
import { IFormulaPageNm } from "@/shared/utils/screens/formula/contentByPages";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import colors from "@/shared/colors";

const Method = ({
  setProgress,
}: {
  setProgress: React.Dispatch<SetStateAction<string[] | IFormulaPageNm[]>>;
}) => {
  // navigation
  const router = useRouter();

  // etc
  const METHOD_BTN = [
    {
      text: "혼자서도 잘해요",
      subText:
        "영양성분 계산이 그다지 필요하지 않은 분들은\n직접 모든 식품을 둘러보고 추가할 수 있어요",
      iconSource: undefined,
      onPress: () => router.push("/Search"),
    },
    {
      text: "자동으로 다섯 근 공식만들기",
      subText:
        "극도로 귀찮으신 분들을 위해 근의공식이\n자동으로 칼탄단지를 모두 맞춘 공식을 만들어드릴게요",
      iconSource: undefined,
      onPress: () => setProgress((v) => [...v, "AMSelect"]),
    },
    {
      text: "한 근씩 직접 공식만들기 (추천)",
      subText:
        "한 근씩 직접 식품을 추가하면서\n영양성분을 맞출 수 있도록 근의공식이 도와드릴게요",
      iconSource: icons.appIcon,
      onPress: () => setProgress((v) => [...v, "Formula"]),
    },
  ];
  return (
    <Container>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingRight: 2 }}
      >
        <BtnBox>
          {METHOD_BTN.map((item, index) => (
            <SelectBtn
              key={index}
              text={item.text}
              subText={item.subText}
              iconSource={item.iconSource}
              leftBar={index === 2}
              onPress={item.onPress}
            />
          ))}
        </BtnBox>
      </ScrollView>
    </Container>
  );
};

export default Method;

const Container = styled.View`
  flex: 1;
`;

const BtnBox = styled.View`
  width: 100%;
  row-gap: 24px;
`;
