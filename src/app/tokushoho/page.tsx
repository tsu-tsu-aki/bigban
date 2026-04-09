import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | THE PICKLE BANG THEORY",
  description: "THE PICKLE BANG THEORYの特定商取引法に基づく表記ページです。",
};

interface TokushohoItem {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

const ITEMS: readonly TokushohoItem[] = [
  { label: "販売者", value: "RST Agency株式会社" },
  { label: "販売責任者", value: "西村昭彦" },
  { label: "所在地", value: "東京都品川区二葉1-4-2" },
  { label: "電話番号", value: "090 5523 3879", href: "tel:09055233879" },
  { label: "受付時間", value: "9:00〜17:00" },
  { label: "メールアドレス", value: "hello@rstagency.com", href: "mailto:hello@rstagency.com" },
  { label: "ホームページURL", value: "https://rstagency.com", href: "https://rstagency.com" },
  { label: "販売価格", value: "商品/イベントページをご参照ください" },
  { label: "商品代金以外の必要料金", value: "商品/イベントページをご参照ください" },
  { label: "引き渡し時期", value: "即日受け渡し" },
  { label: "支払い方法", value: "銀行振込またはクレジットカード" },
  { label: "支払い時期", value: "即日" },
  { label: "カード決済", value: "初回は申し込み時に決済、翌月以降は毎月20日に決済" },
  { label: "返品・交換・キャンセル", value: "不良品以外不可" },
  { label: "対応期限", value: "商品購入より2週間以内" },
  { label: "返品送料", value: "お客様にご負担いただきます" },
];

export default function TokushohoPage() {
  return (
      <main className="min-h-screen bg-deep-black text-text-light pt-24 lg:pt-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-12 py-16 lg:py-20">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-wide mb-12">
            特定商取引法に基づく表記
          </h1>

          <dl className="divide-y divide-text-gray/10">
            {ITEMS.map((item) => (
              <div
                key={item.label}
                className="py-5 sm:grid sm:grid-cols-3 sm:gap-4"
              >
                <dt className="text-sm font-medium text-text-gray">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-text-light sm:col-span-2 sm:mt-0">
                  {item.href ? (
                    <a
                      href={item.href}
                      {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-accent hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
  );
}
