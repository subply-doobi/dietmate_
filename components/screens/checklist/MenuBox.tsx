import styled from 'styled-components/native';
import {icons} from '../../../shared/iconSource';
import {
  Col,
  ShadowView,
  Icon,
  HorizontalSpace,
  TextMain,
} from '../../../shared/ui/styledComps';
import {IFlattedOrderedProduct} from '../util/menuFlat';
import FoodList from './FoodList';
import colors from '../../../shared/colors';
import {updateTotalCheckList} from '../../../shared/utils/asyncStorage';

interface IMenuBox {
  order: IFlattedOrderedProduct[][];
  checklist: string[];
  setChecklist: React.Dispatch<React.SetStateAction<string[]>>;
}
const MenuBox = ({order, checklist, setChecklist}: IMenuBox) => {
  // fn
  const onListBoxPressed = async ({
    orderNo,
    menuNoAndQtyIdx,
  }: {
    orderNo: string;
    menuNoAndQtyIdx: string;
  }) => {
    setChecklist(prev => {
      const newCheckList = prev.includes(menuNoAndQtyIdx)
        ? prev.filter(v => v !== menuNoAndQtyIdx)
        : [...prev, menuNoAndQtyIdx];
      updateTotalCheckList({orderNo, menuNoAndQtyIdx}); // asyncStorage update
      return newCheckList;
    });
  };

  return (
    <>
      {order?.map((menu, idx) => {
        const orderNo = menu[0].orderNo;
        const menuNoAndQtyIdx = `${menu[0].dietNo}/${menu[0].qtyIdx}`;
        return (
          <Col key={idx}>
            <ShadowView style={{borderRadius: 5}}>
              <CheckListBox
                onPress={async () =>
                  onListBoxPressed({
                    orderNo,
                    menuNoAndQtyIdx,
                  })
                }>
                <LeftBar />
                <CheckListTitle>
                  {menu[0].dietSeq}{' '}
                  {menu[0].qtyIdx > 0 && `(${menu[0].qtyIdx + 1})`}
                </CheckListTitle>
                <Icon
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 24,
                    zIndex: 2,
                  }}
                  source={
                    checklist.includes(menuNoAndQtyIdx)
                      ? icons.checkRoundCheckedMain_24
                      : icons.checkRoundEmpty_24
                  }
                />
                <HorizontalSpace height={16} />
                <FoodList menu={menu} />
                {checklist.includes(menuNoAndQtyIdx) && <OpacityView />}
              </CheckListBox>
            </ShadowView>
            {order.length - 1 !== idx && (
              <HorizontalSpace style={{height: 24}} />
            )}
          </Col>
        );
      })}
    </>
  );
};

export default MenuBox;

const CheckListBox = styled.TouchableOpacity`
  background-color: ${colors.white};
  width: 100%;
  border-radius: 5px;
  padding: 24px 16px 32px 16px;
`;

const LeftBar = styled.View<{screen?: 'Home' | 'Diet' | string}>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background-color: ${colors.inactive};
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const CheckListTitle = styled(TextMain)`
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
`;

const OpacityView = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${colors.whiteOpacity70};
  z-index: 1;
`;
