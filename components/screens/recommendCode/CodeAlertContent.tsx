import styled from "styled-components/native";
import { HorizontalSpace, TextMain } from "@/shared/ui/styledComps";
import SquareInput from "@/shared/ui/SquareInput";
import { setValue } from "@/features/reduxSlices/userInputSlice";
import { useAppDispatch, useAppSelector } from "@/shared/hooks/reduxHooks";

interface ICodeAlertContent {
  isCodeError: boolean;
}
const CodeAlertContent = ({ isCodeError }: ICodeAlertContent) => {
  // redux
  const dispatch = useAppDispatch();
  const friendCd = useAppSelector((state) => state.userInput.friendCd);
  const title = isCodeError
    ? "해당 코드가\n유효하지 않아요"
    : "앱을 추천해준 \n친구의 코드를 입력해주세요";

  return (
    <Container>
      <AlertTitle>{title}</AlertTitle>
      <HorizontalSpace height={28} />
      <SquareInput
        value={friendCd.value}
        isActive={true}
        label="친구코드"
        maxLength={6}
        onChangeText={(v) => dispatch(setValue({ name: "friendCd", value: v }))}
      />
    </Container>
  );
};

export default CodeAlertContent;

const Container = styled.View`
  width: 100%;
  padding: 0px 16px;
`;

const AlertTitle = styled(TextMain)`
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  margin-top: 28px;
`;
