import { JSX } from "react";
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
  | "AMSelect"
  | "AMCategory"
  | "AMCompany"
  | "AMPrice"
  | "AMProcessing"
  | "AMError"
  | "None"
  | "SelectNumOfMenu"
  | "SelectMethod"
  | "Formula";

type IPages = {
  header: string;
  name: IFormulaPageNm;
  progress?: number;
  title?: string;
  subTitle?: string;
  render: () => JSX.Element;
}[];

export const PAGES: IPages = [
  {
    progress: 0,
    header: "근수 선택",
    name: "SelectNumOfMenu",
    title: "몇 가지 끼니를 공식으로\n만들 지 결정해주세요",
    subTitle:
      "하루에 한 근(끼)만이라도 간편하게!\n나만의 식단으로 평일 5일 (다섯 근!)을 추천해요",
    render: () => <SelectNumOfMenu />,
  },
  {
    progress: 1 / 10,
    header: "방법 선택",
    name: "SelectMethod",
    title: "공식을 만들\n방법을 선택해주세요",
    subTitle: "한 근씩 공식 만들기를 추천해요",
    render: () => <Method />,
  },
  // 자동구성
  {
    progress: 2 / 10,
    header: "자동 공식",
    name: "AMSelect",
    title: "현재 구성중인\n끼니가 있어요",
    subTitle:
      "자동으로 구성할 끼니를 선택해주세요\n선택된 끼니의 식품들은 초기화됩니다",
    render: () => <Select />,
  },
  {
    progress: 3 / 10,
    header: "자동 공식",
    name: "AMCategory",
    title: "원하는 식품유형을\n3가지 이상 선택해주세요",
    subTitle: "선택한 유형을 포함해 구성됩니다\n모든 유형이 포함되지는 않아요",

    render: () => <Category />,
  },
  {
    progress: 4 / 10,
    header: "자동 공식",
    name: "AMCompany",
    title: "포함하고 싶은\n식품사가 있나요?",
    subTitle: "무료 배송비를 맞추는 데에\n도움이 될 수 있어요",

    render: () => <Company />,
  },
  {
    progress: 5 / 10,
    header: "자동 공식",
    name: "AMPrice",
    title: "한 끼니 가격을\n설정해주세요",
    subTitle: "목표섭취량이 높다면\n가격이 낮을 때 구성이 안될 수 있어요",

    render: () => <Price />,
  },
  {
    progress: 6 / 10,
    header: "자동 공식",
    name: "AMProcessing",
    title: "목표영양에 딱 맞는\n식품 조합 찾는 중",
    subTitle: "조금만 기다려주세요",

    render: () => <Processing />,
  },

  // 근 별 공식 전체 페이지
  {
    progress: 9 / 10,
    header: "공식",
    name: "Formula",
    render: () => <Formula />,
  },
];

export const getPageItem = (pageName: IFormulaPageNm) =>
  PAGES.find((page) => page.name === pageName);
