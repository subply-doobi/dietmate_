import {IDietTotalObjData} from '../api/types/diet';

export const checkNoStockP = (
  DTOData: IDietTotalObjData | undefined,
  dietNo: string,
) => {
  if (!DTOData) return false;
  const dietDetail = DTOData[dietNo]?.dietDetail;
  if (!dietDetail) return false;
  return dietDetail.some(item => item.statusCd !== 'SP012001');
};

export const checkNoStockPAll = (DTOData: IDietTotalObjData | undefined) => {
  if (!DTOData) return false;
  return Object.values(DTOData).some(diet => {
    return diet.dietDetail.some(item => item.statusCd !== 'SP012001');
  });
};
