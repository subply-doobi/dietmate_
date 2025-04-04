import React from "react";
import { Modal } from "react-native";
import styled from "styled-components/native";
import colors from "../../../shared/colors";

interface IDBottomSheet {
  visible: boolean;
  renderContent: () => React.ReactElement;
  onCancel?: Function;
  contentHeight?: number;
}
const DBottomSheet = ({
  visible,
  renderContent,
  onCancel,
  contentHeight,
}: IDBottomSheet) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onCancel ? onCancel() : null;
      }}
    >
      <ModalBackGround
        onPress={() => {
          onCancel && onCancel();
        }}
      >
        <PopUpContainer contentHeight={contentHeight} activeOpacity={1}>
          <PopupIndicator />
          <ContentContainer>{renderContent()}</ContentContainer>
        </PopUpContainer>
      </ModalBackGround>
    </Modal>
  );
};

export default DBottomSheet;

const ModalBackGround = styled.TouchableOpacity`
  flex: 1;
  background-color: #000000a6;
  justify-content: flex-end;
`;

interface IPopUpContainer {
  contentHeight?: number;
  backgroundColor?: string;
}
const PopUpContainer = styled.TouchableOpacity<IPopUpContainer>`
  width: 100%;
  height: ${({ contentHeight }) =>
    contentHeight ? `${contentHeight}px` : "auto"};
  padding: 0px 16px 16px 16px;
  align-items: center;
  background-color: ${({ backgroundColor }) =>
    backgroundColor ? backgroundColor : colors.white};
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const PopupIndicator = styled.View`
  margin-top: 8px;
  width: 64px;
  height: 4px;
  background-color: ${colors.black};
  border-radius: 2px;
`;

const ContentContainer = styled.View`
  width: 100%;
`;
