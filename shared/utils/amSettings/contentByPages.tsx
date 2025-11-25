import { JSX } from "react";
import Category from "@/components/screens/autoMenu/subScreens/Category";
import Company from "@/components/screens/autoMenu/subScreens/Company";
import Price from "@/components/screens/autoMenu/subScreens/Price";

export type IAmSettingsPageNm = "AMCategory" | "AMCompany" | "AMPrice";

type IPages = {
  header: string;
  name: IAmSettingsPageNm;
  progress?: number;
  title?: string;
  subTitle?: string;
  render: () => JSX.Element;
}[];

export const PAGES: IPages = [
  {
    progress: 1 / 3,
    header: "자동 공식",
    name: "AMCategory",
    title: "원하는 식품유형을\n3가지 이상 선택해주세요",
    subTitle: "선택한 유형을 포함해 구성됩니다\n모든 유형이 포함되지는 않아요",
    render: () => <Category />,
  },
  {
    progress: 2 / 3,
    header: "자동 공식",
    name: "AMCompany",
    title: "포함하고 싶은\n식품사가 있나요?",
    subTitle: "무료 배송비를 맞추는 데에\n도움이 될 수 있어요",
    render: () => <Company />,
  },
  {
    progress: 3 / 3,
    header: "자동 공식",
    name: "AMPrice",
    title: "한 끼니 가격을\n설정해주세요",
    subTitle: "목표섭취량이 높다면\n가격이 낮을 때 구성이 안될 수 있어요",
    render: () => <Price />,
  },
];

export const getPageItem = (pageName: IAmSettingsPageNm) =>
  PAGES.find((page) => page.name === pageName);
