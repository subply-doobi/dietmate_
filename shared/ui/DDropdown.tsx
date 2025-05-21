import React, { SetStateAction, useState } from "react";
import styled from "styled-components/native";
import DropDownPicker from "react-native-dropdown-picker";

import colors from "../../shared/colors";
import { Col, InputHeaderText } from "../../shared/ui/styledComps";
import { ViewStyle } from "react-native";

interface CategoryObject {
  label: string;
  value: string;
}
interface IDDropdown {
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  items: Array<CategoryObject> | undefined;
  scrollRef?: any;
  style?: ViewStyle;
}

const DDropdown = (props: IDDropdown) => {
  const [open, setOpen] = useState(false);
  const { placeholder, value, setValue, items, scrollRef, style } = props;

  // Wrapper function for DropDownPicker's setValue
  const handleSetValue = (callback: React.SetStateAction<string>) => {
    // Extract the new value from the callback
    const newValue =
      typeof callback === "function" ? callback(value) : callback;

    // Dispatch Redux action or update state
    typeof newValue === "string" && setValue(newValue);
  };

  return (
    <Col style={[{ width: "100%" }, { ...style }]}>
      <DropdownHeader isActive={true}>{placeholder}</DropdownHeader>
      <DropDownPicker<string>
        style={{
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: colors.inactive,
          // backgroundColor: 'red',
          borderRadius: 0,
        }}
        dropDownContainerStyle={{
          position: "relative",
          marginTop: -42,
          marginBottom: 40,
          paddingBottom: 4,
          borderRadius: 0,
          borderWidth: 1,
          borderTopWidth: 0,
          borderBottomWidth: 1,
          elevation: 3,
          borderColor: colors.inactive,
          zIndex: 6000,
        }}
        selectedItemContainerStyle={{
          backgroundColor: colors.highlight,
        }}
        textStyle={{
          fontSize: 16,
          fontWeight: "normal",
          color: colors.textMain,
          marginLeft: -10,
        }}
        showTickIcon={false}
        open={open}
        setOpen={() => {
          scrollRef && !open && scrollRef.current.scrollToEnd();
          setOpen((open) => !open);
        }}
        value={value}
        items={items || []}
        //   onChangeValue={() => {}}
        listMode="SCROLLVIEW"
        dropDownDirection="BOTTOM"
        setValue={handleSetValue}
      />
    </Col>
  );
};

export default DDropdown;

const DropdownHeader = styled(InputHeaderText)``;
