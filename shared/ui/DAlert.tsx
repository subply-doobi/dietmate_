import React, {useEffect, useState} from 'react';
import {Modal, ViewProps} from 'react-native';
import styled from 'styled-components/native';

import colors from '../colors';
import {DALERT_WIDTH, SCREENWIDTH} from '../constants';
import {Icon, Row, TextMain} from './styledComps';
import {icons} from '../iconSource';

interface IDAlert extends ViewProps {
  alertShow: boolean;
  renderContent: () => React.ReactElement;
  onConfirm: Function;
  onCancel: Function;
  confirmLabel?: string;
  cancelLabel?: string;
  showTopCancel?: boolean;
  NoOfBtn?: 0 | 1 | 2;
  contentDelay?: number;
}
const DAlert = ({
  alertShow,
  renderContent,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  showTopCancel = false,
  NoOfBtn = 2,
  contentDelay,
  ...props
}: IDAlert) => {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!alertShow) {
      setContentVisible(false);
      return;
    }
    setTimeout(() => {
      setContentVisible(true);
    }, contentDelay);
  }, [alertShow]);

  return alertShow != null ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={alertShow ? true : false}
      onRequestClose={() => onCancel && onCancel()}>
      <ModalBackGround>
        {contentVisible && (
          <PopUpContainer {...props}>
            <ContentContainer>{renderContent()}</ContentContainer>

            {/* 취소 | 확인 버튼 */}
            {NoOfBtn !== 0 && (
              <Row>
                {NoOfBtn === 2 && (
                  <BtnLeft onPress={() => onCancel && onCancel()}>
                    <CancelBtnText>
                      {' '}
                      {cancelLabel ? cancelLabel : '취소'}
                    </CancelBtnText>
                  </BtnLeft>
                )}

                <BtnRight
                  style={{borderBottomLeftRadius: NoOfBtn === 1 ? 10 : 0}}
                  onPress={async () => onConfirm && (await onConfirm())}>
                  <ConfirmBtnText>
                    {confirmLabel ? confirmLabel : '확인'}
                  </ConfirmBtnText>
                </BtnRight>
              </Row>
            )}
            {showTopCancel && (
              <TopCancelBtn onPress={() => onCancel && onCancel()}>
                <Icon source={icons.cancelRound_24} />
              </TopCancelBtn>
            )}
          </PopUpContainer>
        )}
      </ModalBackGround>
    </Modal>
  ) : null;
};

export default DAlert;

const ModalBackGround = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.backgroundModal};
`;

interface IPopUpContainer {
  width?: number;
  height?: number;
  backgroundColor?: string;
}
const PopUpContainer = styled.View<IPopUpContainer>`
  width: ${DALERT_WIDTH}px;
  background-color: ${colors.white};
  border-radius: 10px;
`;

const ContentContainer = styled.View``;

const BtnLeft = styled.TouchableOpacity`
  flex: 1;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 10px;
  border-top-width: 1px;
  border-right-width: 0.5px;
  border-color: ${colors.inactive};
`;
const BtnRight = styled.TouchableOpacity`
  flex: 1;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-bottom-right-radius: 10px;
  border-top-width: 1px;
  border-left-width: 0.5px;
  border-color: ${colors.inactive};
`;
const ConfirmBtnText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  color: ${colors.main};
`;
const CancelBtnText = styled(TextMain)`
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  color: ${colors.textSub};
`;

const TopCancelBtn = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  position: absolute;
  top: 0;
  right: 0;
  justify-content: center;
  align-items: center;
`;
