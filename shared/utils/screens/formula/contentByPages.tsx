import { JSX } from "react";
import SelectNumOfMenu from "@/components/screens/formula/subScreens/SelectNumOfMenu";
import Formula from "@/components/screens/formula/subScreens/Formula";

export type IFormulaPageNm = string | "SelectNumOfMenu" | "Formula";

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
      "세 가지 끼니로 시작해보세요\n같은 끼니를 여러 개 구매할 수 있어요",
    render: () => <SelectNumOfMenu />,
  },
  // {
  //   ... SelectMethod removed ...
  // },
  // 자동구성
  // {
  //   ... AMSelect moved to amSettings ...
  // },
  // {
  //   ... AMCategory moved to amSettings ...
  // },
  // {
  //   ... AMCompany moved to amSettings ...
  // },
  // {
  //   ... AMPrice moved to amSettings ...
  // },
  // {
  //   ... AMProcessing not used here ...
  // },

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
