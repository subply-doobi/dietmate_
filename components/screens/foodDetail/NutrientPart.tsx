import {Text, StyleSheet, View} from 'react-native';

import colors from '../../../shared/colors';
import {Dot, TextMain} from '../../../shared/ui/styledComps';
import styled from 'styled-components/native';
import {ITableItem} from '../util/makeNutrTable';
import {useGetUser} from '../../../shared/api/queries/user';

const NutrientPart = ({table}: {table: ITableItem[]}) => {
  const userProfileQuery = useGetUser();
  const {isLoading, data, isError, error} = userProfileQuery;
  //userPriofileQuery 데이터별로 분기처리

  if (isLoading) {
    return <Text>Loading</Text>;
  }
  if (isError) {
    console.error(error);
  }

  return (
    <TableContainer>
      <FirstRow>
        <Column1>
          <MainText>총 내용량</MainText>
        </Column1>
        <Column2>
          <MainText>250g</MainText>
          <View>
            <SubText>{data?.nickNm}님의 1일</SubText>
            <SubText>목표섭취량에 대한 비율</SubText>
          </View>
        </Column2>
      </FirstRow>
      <TableContent table={table} />
    </TableContainer>
  );
};

const TableContent = ({table}: {table: ITableItem[]}) => {
  return table.map(item => (
    <Row key={item.name}>
      <Column1 style={{backgroundColor: item.color && colors.backgroundLight2}}>
        <MainText>{item.column1}</MainText>
        {item.color ? <Dot backgroundColor={item.color} /> : null}
      </Column1>
      <Column2 style={{backgroundColor: item.color && colors.backgroundLight2}}>
        <MainText>{item.column2}</MainText>
        <View>
          <MainText>{item.rate}</MainText>
        </View>
      </Column2>
    </Row>
  ));
};

export default NutrientPart;

const TableContainer = styled.View`
  flex: 1;
  border-color: ${colors.lineLight};
  border-width: 1px;
`;

const SubText = styled(TextMain)`
  font-size: 12px;
  text-align: right;
`;

const MainText = styled(TextMain)`
  font-size: 16px;
`;
const Row = styled.View`
  flex-direction: row;
  align-items: center;
  border-top-width: 1px;
  border-color: ${colors.lineLight};
  height: 36px;
`;
const FirstRow = styled(Row)`
  height: 64px;
  border-top-width: 0px;
`;

const Column1 = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 120px;
  padding: 0 8px;
  height: 100%;
`;

const Column2 = styled.View`
  flex: 1;
  height: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 0 16px;
  border-left-width: 1px;
  border-color: ${colors.lineLight};
`;
