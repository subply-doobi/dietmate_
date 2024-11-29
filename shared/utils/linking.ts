import {Linking} from 'react-native';

export const link = (url: string) => Linking.openURL(url);
