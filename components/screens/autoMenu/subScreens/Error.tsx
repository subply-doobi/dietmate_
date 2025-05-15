import { Col } from "@/shared/ui/styledComps";
import CtaButton from "@/shared/ui/CtaButton";
import { useRouter } from "expo-router";
import GuideTitle from "@/shared/ui/GuideTitle";

const Error = () => {
  const router = useRouter();

  return (
    <Col style={{ justifyContent: "center", marginTop: 64 }}>
      <GuideTitle
        title="오류가 발생했어요\n"
        subTitle="계속 문제가 발생한다면\n고객센터로 문의바랍니다"
      />
      <CtaButton
        btnStyle="border"
        btnText="뒤로가기"
        onPress={() => router.back()}
      />
    </Col>
  );
};

export default Error;
