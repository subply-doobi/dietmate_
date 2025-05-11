import colors from "@/shared/colors";
import { SetStateAction } from "react";
import { IAutoMenuSubPageNm } from "../autoMenu/contentByPages";
import Select from "@/components/screens/autoMenu/subScreens/Select";
import Category from "@/components/screens/autoMenu/subScreens/Category";
import Company from "@/components/screens/autoMenu/subScreens/Company";
import Price from "@/components/screens/autoMenu/subScreens/Price";
import Processing from "@/components/screens/autoMenu/subScreens/Processing";
import SelectNumOfMenu from "@/components/screens/formula/subScreens/SelectNumOfMenu";
import Method from "@/components/screens/formula/subScreens/Method";
import Formula from "@/components/screens/formula/subScreens/Formula";

export type IFormulaPageNm =
  | string
  | "SelectNumOfMenu"
  | "SelectMethod"
  | "Formula"
  | IAutoMenuSubPageNm;

interface IPageCheckIsActive {
  selectedDietNo?: string[];
  selectedCategory?: boolean[];
}

type IPages = {
  header: string;
  name: IFormulaPageNm;
  progress?: number;
  title?: string;
  subTitle?: string;
  render: (
    setProgress: React.Dispatch<SetStateAction<string[]>>
  ) => JSX.Element;
}[];

export const PAGES: IPages = [
  {
    progress: 0,
    header: "근수 선택",
    name: "SelectNumOfMenu",
    title: "몇 끼를 공식으로 만들지\n결정해주세요",
    subTitle:
      "하루에 한 근(끼)만이라도 간편하게!\n나만의 식단으로 평일 5일 (다섯 근!)을 추천해요",
    render: (setProgress) => <SelectNumOfMenu setProgress={setProgress} />,
  },
  {
    progress: 1 / 10,
    header: "방법 선택",
    name: "SelectMethod",
    title: "공식을 만들\n방법을 선택해주세요",
    subTitle: "한 근씩 직접 공식 만들기를 추천해요",
    render: (setProgress) => <Method setProgress={setProgress} />,
  },
  // 자동구성
  {
    progress: 2 / 10,
    header: "자동 공식",
    name: "AMSelect",
    title: "현재 구성중인\n끼니가 있어요",
    subTitle:
      "자동으로 구성할 끼니를 선택해주세요\n선택된 끼니의 식품들은 초기화됩니다",
    render: (setProgress) => <Select setProgress={setProgress} />,
  },
  {
    progress: 3 / 10,
    header: "자동 공식",
    name: "AMCategory",
    title: "원하는 식품유형을\n3가지 이상 선택해주세요",
    subTitle: "선택한 유형을 포함해 구성됩니다\n모든 유형이 포함되지는 않아요",

    render: (setProgress) => <Category setProgress={setProgress} />,
  },
  {
    progress: 4 / 10,
    header: "자동 공식",
    name: "AMCompany",
    title: "포함하고 싶은\n식품사가 있나요?",
    subTitle: "무료 배송비를 맞추는 데에\n도움이 될 수 있어요",

    render: (setProgress) => <Company setProgress={setProgress} />,
  },
  {
    progress: 5 / 10,
    header: "자동 공식",
    name: "AMPrice",
    title: "한 끼니 가격을\n설정해주세요",
    subTitle: "목표섭취량이 높다면\n가격이 낮을 때 구성이 안될 수 있어요",

    render: (setProgress) => <Price setProgress={setProgress} />,
  },
  {
    progress: 6 / 10,
    header: "자동 공식",
    name: "AMProcessing",
    title: "목표영양에 딱 맞는\n식품 조합 찾는 중",
    subTitle: "조금만 기다려주세요",

    render: (setProgress) => <Processing setProgress={setProgress} />,
  },

  // 근 별 공식 전체 페이지
  {
    progress: 7 / 10,
    header: "공식",
    name: "Formula",
    render: (setProgress) => <Formula setProgress={setProgress} />,
  },
];

export const getPageItem = (pageName: IFormulaPageNm) =>
  PAGES.find((page) => page.name === pageName);
