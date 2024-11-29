import styled from 'styled-components/native';
import colors from '../colors';
import {Modal, ViewProps} from 'react-native';
import {useEffect, useState} from 'react';

interface IDTPScreen extends ViewProps {
  visible: boolean;
  renderContent: () => React.ReactElement;
  contentDelay?: number;
}
const DTPScreen = ({
  visible,
  renderContent,
  contentDelay,
  ...props
}: IDTPScreen) => {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setContentVisible(false);
      return;
    }
    setTimeout(() => {
      setContentVisible(true);
    }, contentDelay);
  }, [visible]);

  return (
    <Modal animationType="none" transparent={true} visible={visible}>
      <ModalBackGround {...props}>
        {contentVisible && (
          <ContentContainer>{renderContent()}</ContentContainer>
        )}
      </ModalBackGround>
    </Modal>
  );
};

export default DTPScreen;

const ModalBackGround = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${colors.backgroundModal};
`;

const ContentContainer = styled.View`
  flex: 1;
  width: 100%;
`;
