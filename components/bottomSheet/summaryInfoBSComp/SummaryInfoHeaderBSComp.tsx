import CartSummary from "@/components/screens/diet/CartSummary";
import colors from "@/shared/colors";

const SummaryInfoHeaderBSComp = () => {
  return (
    <CartSummary
      containerStyle={{
        paddingTop: 16,
        paddingBottom: 32,
        paddingHorizontal: 16,
      }}
      mainTextColor={colors.inactive}
      simplified={true}
    />
  );
};

export default SummaryInfoHeaderBSComp;
