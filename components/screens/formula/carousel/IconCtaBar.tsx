import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import colors from "@/shared/colors";
import Icon from "@/shared/ui/Icon";
import { Row, Col, TextMain } from "@/shared/ui/styledComps";

interface IIconCtaBarProps {
  onSettings: () => void;
  onAddProduct: () => void;
  onAutoMenu: () => void;
  disabledAdd: boolean;
  showOverwriteConfirm: boolean;
  onConfirmOverwrite: () => void;
  onCancelOverwrite: () => void;
  globalLoading: boolean;
  isCurrent: boolean;
}

const IconCtaBar = ({
  onSettings,
  onAddProduct,
  onAutoMenu,
  disabledAdd,
  showOverwriteConfirm,
  onConfirmOverwrite,
  onCancelOverwrite,
  globalLoading,
  isCurrent,
}: IIconCtaBarProps) => {
  return (
    <>
      <BarContainer>
        <IconBtn
          onPress={onSettings}
          style={[
            {
              boxShadow: "1px 2px 4px 1px rgba(0, 0, 0, 0.15)",
            },
          ]}
        >
          <Icon
            name="setting"
            boxSize={40}
            iconSize={20}
            color={colors.textSub}
          />
        </IconBtn>
        {!disabledAdd && (
          <IconBtn
            onPress={onAddProduct}
            disabled={disabledAdd}
            style={[
              {
                boxShadow: "1px 2px 4px 1px rgba(0, 0, 0, 0.15)",
              },
            ]}
          >
            <Icon
              name="plus"
              boxSize={40}
              iconSize={24}
              color={disabledAdd ? colors.inactive : colors.textSub}
            />
          </IconBtn>
        )}
        <IconBtn
          onPress={onAutoMenu}
          style={[
            {
              boxShadow: "1px 2px 4px 1px rgba(0, 0, 0, 0.15)",
            },
          ]}
        >
          <Icon
            name="squareRootBox"
            boxSize={40}
            iconSize={24}
            color={colors.main}
          />
        </IconBtn>
      </BarContainer>

      {/* Loading overlay */}
      {globalLoading && isCurrent && (
        <OpacityView>
          <Col style={{ rowGap: 4 }}>
            <LoadingText>잠시만 기다려주세요</LoadingText>
            <LoadingSubText>자동으로 영양성분 채우는 중...</LoadingSubText>
          </Col>
          <ActivityIndicator
            size={"small"}
            color={colors.white}
            style={{ marginTop: 24 }}
          />
        </OpacityView>
      )}

      {/* Overwrite confirm overlay */}
      {showOverwriteConfirm && (
        <OpacityView>
          <Col style={{ rowGap: 4 }}>
            <LoadingText>현재 근에 식품이 충분해요</LoadingText>
            <LoadingText>기존 식품들을 덮어쓸까요?</LoadingText>
          </Col>
          <Row style={{ position: "absolute", bottom: 0, width: "100%" }}>
            <CheckOverwriteBtn onPress={onCancelOverwrite}>
              <SelectedText>취소</SelectedText>
            </CheckOverwriteBtn>
            <CheckOverwriteBtn onPress={onConfirmOverwrite}>
              <SelectedText>확인</SelectedText>
            </CheckOverwriteBtn>
          </Row>
        </OpacityView>
      )}
    </>
  );
};

export default IconCtaBar;

const BarContainer = styled(Row)`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0 24px 24px 24px;
  column-gap: 12px;
  justify-content: flex-end;
`;

const IconBtn = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${colors.backgroundLight2};
  justify-content: center;
  align-items: center;
`;

const OpacityView = styled.View`
  background-color: ${colors.blackOpacity70};
  position: absolute;
  border-radius: 0 0 5px 5px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 20px;
  color: ${colors.white};
  text-align: center;
`;

const LoadingSubText = styled(TextMain)`
  font-size: 14px;
  line-height: 18px;
  color: ${colors.inactive};
  text-align: center;
`;

const CheckOverwriteBtn = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-width: 1px;
  border-color: ${colors.line};
  justify-content: center;
  align-items: center;
`;

const SelectedText = styled(TextMain)`
  color: ${colors.white};
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
`;
