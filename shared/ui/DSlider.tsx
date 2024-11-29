import {SetStateAction} from 'react';
import styled from 'styled-components/native';
import {Slider} from '@miblanchard/react-native-slider';
import colors from '../colors';
import {commaToNum} from '../utils/sumUp';
import {TextMain} from './styledComps';

interface IDSlider {
  sliderValue: number[];
  setSliderValue: React.Dispatch<SetStateAction<number[]>>;
  onSlidingComplete?: (value: number | Array<number>) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  sliderWidth?: number;
  text?: string;
}
/** sliderWidth만 선택사항. props 안넘기면 width: 100% 적용 */
const DSlider = ({
  sliderValue,
  setSliderValue,
  onSlidingComplete,
  minimumValue,
  maximumValue,
  step,
  sliderWidth,
  text,
}: IDSlider) => {
  const width = sliderWidth ? sliderWidth : '100%';
  return (
    <Container>
      <SliderContainer style={{width}}>
        <Slider
          value={sliderValue}
          onValueChange={value => Array.isArray(value) && setSliderValue(value)}
          onSlidingComplete={onSlidingComplete}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={colors.main}
          maximumTrackTintColor={colors.inactive}
          trackStyle={{height: 2}}
          renderThumbComponent={() => <Thumb />}
          renderAboveThumbComponent={index => (
            <AboveThumbComponent thumbIdx={index}>
              <ThumbText>
                {commaToNum(sliderValue[index])}원{text}
              </ThumbText>
            </AboveThumbComponent>
          )}
        />
      </SliderContainer>
    </Container>
  );
};
export default DSlider;

const THUMB_SIZE = 20;

const Container = styled.View`
  width: 100%;
  align-items: center;
  margin-top: -8px;
  padding-bottom: 16px;
`;

const SliderContainer = styled.View`
  width: 100%;
  margin-top: 24px;
`;

const AboveThumbComponent = styled.View<{thumbIdx: number}>`
  width: 56px;
  height: 20px;
  position: absolute;
  left: -28px;
  top: ${({thumbIdx}) =>
    thumbIdx === 0 ? (THUMB_SIZE / 2) * 3 + 6 : -(THUMB_SIZE / 2 + 6)}px;
  align-items: center;
  justify-content: center;
`;

const ThumbText = styled(TextMain)`
  font-size: 14px;
`;

const Thumb = styled.View`
  width: ${THUMB_SIZE}px;
  height: ${THUMB_SIZE}px;
  background-color: ${colors.white};
  border-width: 2px;
  border-color: ${colors.main};
  border-radius: 10px;
`;
