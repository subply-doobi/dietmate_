import {IDietData, IDietDetailData, IDietTotalObjData} from '../api/types/diet';
import MenuAcInactiveHeader from '../../components/menuAccordion/MenuAcInactiveHeader';
import {IBaseLineData} from '../api/types/baseLine';
import MenuAcActiveHeader from '../../components/menuAccordion/MenuAcActiveHeader';
import MenuAcContent from '../../components/menuAccordion/MenuAcContent';

interface IGetMenuAcContent {
  bLData: IBaseLineData | undefined;
  dTOData: IDietTotalObjData | undefined;
}
export const getMenuAcContent = ({bLData, dTOData}: IGetMenuAcContent) => {
  if (!bLData || !dTOData)
    return [{activeHeader: <></>, inactiveHeader: <></>, content: <></>}];
  return Object.keys(dTOData).map((dietNo, idx) => {
    return {
      activeHeader: <MenuAcActiveHeader dietNo={dietNo} bLData={bLData} />,
      inactiveHeader: <MenuAcInactiveHeader bLData={bLData} dietNo={dietNo} />,
      content: <MenuAcContent dietNo={dietNo} />,
    };
  });
};
