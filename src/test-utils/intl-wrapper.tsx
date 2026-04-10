import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import jaMessages from "../../messages/ja.json";
import enMessages from "../../messages/en.json";

const messages = { ja: jaMessages, en: enMessages } as const;

type Locale = "ja" | "en";

interface IntlRenderOptions {
  locale?: Locale;
}

export function renderWithIntl(
  ui: ReactElement,
  { locale = "ja" }: IntlRenderOptions = {}
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {ui}
    </NextIntlClientProvider>
  );
}
