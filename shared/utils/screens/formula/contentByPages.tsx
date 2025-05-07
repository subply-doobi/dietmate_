export type IFormulaPageNm = "Start";

const PAGES = [
  {
    header: "근수 선택",
    name: "SelectNumOfMenu",
    getNextPage: () => "SelectMethod",
    checkIsActive: () => true,
    render: () => <></>,
  },
  {
    header: "방법 선택",
    name: "SelectMethod",
    getNextPage: () => "Result",
    checkIsActive: () => true,
    render: () => <></>,
  },
  {
    header: "공식",
    name: "Formula",
    getNextPage: () => null,
    checkIsActive: () => true,
    render: () => <></>,
  },
];

export const getPageItem = (pageName: IFormulaPageNm) =>
  PAGES.find((page) => page.name === pageName);
