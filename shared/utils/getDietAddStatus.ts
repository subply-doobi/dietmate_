import {IDietTotalObjData} from '../api/types/diet';

export const getAddDietStatusFrDTData = (
  dTOData: IDietTotalObjData | undefined,
) => {
  if (!dTOData) return {status: 'noData', text: '데이터가 없습니다.'};
  const dietNoArr = Object.keys(dTOData);
  const numOfMenu = dietNoArr.length;
  const hasEmptyMenu = dietNoArr.some(
    dietNo => dTOData[dietNo].dietDetail.length === 0,
  );
  const status = !dTOData
    ? 'noData'
    : numOfMenu >= 10
      ? 'limit'
      : hasEmptyMenu
        ? 'empty'
        : 'possible';

  const text =
    status === 'noData'
      ? '데이터가 없습니다.'
      : status === 'limit'
        ? '끼니는 최대 10개까지만\n추가할 수 있습니다.'
        : status === 'empty'
          ? '비어있는 끼니를 구성하고\n이용해보세요'
          : '추가 가능한\n끼니입니다.';

  return {status, text};
};
