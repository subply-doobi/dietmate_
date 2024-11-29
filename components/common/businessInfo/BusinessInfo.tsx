import styled from 'styled-components/native';
import {BUSINESS_INFO} from '../../../shared/constants';
import {HorizontalSpace, TextSub} from '../../../shared/ui/styledComps';

const BusinessInfo = ({bgColor}: {bgColor?: string}) => {
  return (
    <Container style={{backgroundColor: bgColor && bgColor}}>
      <BusinessNm>{BUSINESS_INFO.name}</BusinessNm>

      <HorizontalSpace height={8} />
      <ContentsText>대표자: {BUSINESS_INFO.representative}</ContentsText>
      <ContentsText>
        사업자등록번호: {BUSINESS_INFO.businessNumber}
      </ContentsText>
      <ContentsText>주소: {BUSINESS_INFO.address}</ContentsText>

      <HorizontalSpace height={8} />
      <ContentsText>이메일: {BUSINESS_INFO.email}</ContentsText>
      <ContentsText>대표번호: {BUSINESS_INFO.phone}</ContentsText>
    </Container>
  );
};

export default BusinessInfo;

const Container = styled.View`
  flex: 1;
  margin-top: 40px;
  padding: 64px 16px 80px 16px;
`;
const BusinessNm = styled(TextSub)`
  font-size: 12px;
`;
const ContentsText = styled(TextSub)`
  margin-top: 2px;
  font-size: 11px;
`;
