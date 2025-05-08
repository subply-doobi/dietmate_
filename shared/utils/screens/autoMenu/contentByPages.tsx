import { SetStateAction } from "react";
import colors from "@/shared/colors";
import Category from "@/components/screens/autoMenu/subScreens/Category";
import Company from "@/components/screens/autoMenu/subScreens/Company";
import Price from "@/components/screens/autoMenu/subScreens/Price";
import Processing from "@/components/screens/autoMenu/subScreens/Processing";
import Select from "@/components/screens/autoMenu/subScreens/Select";

export type IAutoMenuSubPageNm =
  | string
  | "AMSelect"
  | "AMCategory"
  | "AMCompany"
  | "AMPrice"
  | "AMProcessing"
  | "AMError"
  | "None";

type IPages = {
  name: IAutoMenuSubPageNm;
  title: string;
  subTitle: string;
  render: (
    setProgress: React.Dispatch<SetStateAction<string[]>>
  ) => JSX.Element;
}[];
export const PAGES: IPages = [
  {
    name: "AMSelect",
    title: "현재 구성중인\n끼니가 있어요",
    subTitle:
      "자동으로 구성할 끼니를 선택해주세요\n선택된 끼니의 식품들은 초기화됩니다",
    render: (setProgress) => <Select setProgress={setProgress} />,
  },
  {
    name: "AMCategory",
    title: "원하는 식품유형을\n3가지 이상 선택해주세요",
    subTitle: "선택한 유형을 포함해 구성됩니다\n모든 유형이 포함되지는 않아요",
    render: (setProgress) => <Category setProgress={setProgress} />,
  },
  {
    name: "AMCompany",
    title: "포함하고 싶은\n식품사가 있나요?",
    subTitle: "무료 배송비를 맞추는 데에\n도움이 될 수 있어요",
    render: (setProgress) => <Company setProgress={setProgress} />,
  },
  {
    name: "AMPrice",
    title: "한 끼니 가격을\n설정해주세요",
    subTitle: "목표섭취량이 높다면\n가격이 낮을 때 구성이 안될 수 있어요",
    render: (setProgress) => <Price setProgress={setProgress} />,
  },
  {
    name: "AMProcessing",
    title: "목표영양에 딱 맞는\n식품 조합 찾는 중",
    subTitle: "조금만 기다려주세요",
    render: (setProgress) => <Processing setProgress={setProgress} />,
  },
];
