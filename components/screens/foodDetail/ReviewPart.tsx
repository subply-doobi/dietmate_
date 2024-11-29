import React from 'react';
import {Text, SafeAreaView, StyleSheet} from 'react-native';

import {HorizontalSpace} from '../../../shared/ui/styledComps';
import colors from '../../../shared/colors';

const ReviewPart = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.explain}>[두비] 서비스는 현재</Text>
      <Text style={styles.explain}>테스트 버전입니다.</Text>
      <HorizontalSpace height={10} />
      <Text style={styles.explain}>후기 기능은 정식출시를</Text>
      <Text style={styles.explain}>조금만 기다려주세요</Text>

      <HorizontalSpace height={20} />
    </SafeAreaView>
  );
};
export default ReviewPart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  explain: {
    fontSize: 20,
    textAlign: 'center',
  },
});
