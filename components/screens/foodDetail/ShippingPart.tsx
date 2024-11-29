import {SafeAreaView} from 'react-native';

import {TextMain} from '../../../shared/ui/styledComps';
import styled from 'styled-components/native';
import colors from '../../../shared/colors';
import {link} from '../../../shared/utils/linking';
import {INQUIRY_URL} from '../../../shared/constants';

interface IShippingPart {
  platformUrl: string;
  platformNm: string;
}
const ShippingPart = ({platformUrl, platformNm}: IShippingPart) => {
  const isDietmate = platformNm === '근의공식';
  return (
    <SafeAreaView>
      <Desc>
        근의공식은 여러 업체들의 식품들로 {`\n`}
        고객님이 구성한 식단을 {`\n`}한 번에 결제할 수 있도록 도와드립니다.
        {`\n`}
        {`\n`}
        <Desc style={{fontWeight: 'bold'}}>
          (배송완료까지 2~4 영업일 소요)
        </Desc>{' '}
        {`\n`}
        {`\n`}
        결제된 식품들은 해당 식품사에서 배송을 보내드리므로 {`\n`}각 식품사의
        배송정책이 적용됩니다. {`\n`}
      </Desc>

      {!isDietmate && (
        <Desc>
          배송정책이 궁금하시다면 {`\n`}
          식품사의 공식 쇼핑몰을 방문해보세요
        </Desc>
      )}

      {!isDietmate && (
        <LinkText onPress={() => link(platformUrl)}>
          {platformNm} 방문하기
        </LinkText>
      )}
      {isDietmate && (
        <Desc>
          근의공식에서 직접 배송을 보내드리는 상품의 경우 {`\n`}
          문의사항이 있다면 고객센터로 문의해주세요.
        </Desc>
      )}
      {isDietmate && (
        <LinkText onPress={() => link(INQUIRY_URL)}>고객센터</LinkText>
      )}
    </SafeAreaView>
  );
};
export default ShippingPart;

const Desc = styled(TextMain)``;

const LinkText = styled.Text`
  font-size: 14px;
  font-style: italic;
  color: ${colors.textLink};
  text-decoration-line: underline;

  margin-top: 24px;
`;
