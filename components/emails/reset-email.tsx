import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  requestTime: string;
}

const PasswordResetEmail = ({
  userName,
  resetUrl,
  requestTime,
}: PasswordResetEmailProps) => {
  return (
    <Html lang="kk" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Text className="text-[24px] font-bold text-gray-900 m-0">
                Құпиясөзді қалпына келтіру
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                Сәлем, {userName}!
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[16px]">
                {requestTime} уақытында құпиясөзді қалпына келтіру сұрауы
                алынды. Жаңа құпиясөз орнату үшін батырманы басыңыз.
              </Text>
              <Text className="text-[16px] text-gray-700 leading-[24px] mb-[24px]">
                Қауіпсіздік үшін сілтеме бір рет қана қолданылады.
              </Text>
            </Section>

            {/* Reset Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetUrl}
                className="bg-red-600 text-white px-[32px] py-[12px] rounded-[6px] text-[16px] font-semibold no-underline box-border hover:bg-red-700"
              >
                Жаңа құпиясөз орнату
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[8px]">
                Батырма ашылмаса, сілтемені көшіріп браузерге қойыңыз:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all">
                {resetUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[24px]" />

            {/* Security Notice */}
            <Section className="mb-[24px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[16px]">
                <strong>Қауіпсіздік:</strong>
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[12px]">
                • Егер сұрауды сіз жібермеген болсаңыз, хатты елемеңіз.
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[12px]">
                • Сілтеме тек бір рет қолданылады және оның мерзімі шектеулі.
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[12px]">
                • Күмәнді хаттар қайталанса, қолдау қызметіне хабарласыңыз.
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="bg-gray-50 p-[20px] rounded-[6px] mb-[24px]">
              <Text className="text-[14px] text-gray-700 leading-[20px] mb-[8px] font-semibold">
                Көмек қажет пе?
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] m-0">
                Қиындық туындаса, GeoKenistik қолдау бөліміне жазыңыз.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                Бұл хат GeoKenistik платформасынан жіберілді.
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © {new Date().getFullYear()} GeoKenistik.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
