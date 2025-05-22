import { IDietTotalObjData } from "../api/types/diet";
import { MENU_NUM_LABEL } from "../constants";

export const getAddDietStatusFrDTData = (
  dTOData: IDietTotalObjData | undefined
) => {
  if (!dTOData) return { status: "noData", text: "데이터가 없습니다." };
  const dietNoArr = Object.keys(dTOData);
  const numOfMenu = dietNoArr.length;
  const hasEmptyMenu = dietNoArr.some(
    (dietNo) => dTOData[dietNo].dietDetail.length === 0
  );
  const status = !dTOData
    ? "noData"
    : numOfMenu >= MENU_NUM_LABEL.length
    ? "limit"
    : hasEmptyMenu
    ? "empty"
    : "possible";

  const text =
    status === "noData"
      ? "데이터가 없습니다."
      : status === "limit"
      ? `${
          MENU_NUM_LABEL[MENU_NUM_LABEL.length - 1]
        } 까지만\n추가할 수 있습니다.`
      : status === "empty"
      ? "비어있는 근이 있어요"
      : "추가 가능한\n근입니다.";

  const subText =
    status === "limit"
      ? "냉장고 부피 이슈가 발생할 수 있어요"
      : status === "empty"
      ? "식품을 먼저 추가해주세요"
      : "";

  return { status, text, subText };
};
