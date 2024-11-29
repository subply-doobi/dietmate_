import {PAGES} from './contentBypages';

export const getPageItem = (pageNm: string) =>
  PAGES.find(p => p.name === pageNm) || PAGES[0];
