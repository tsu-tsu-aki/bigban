import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../messages/ja.json";
import PlayerCard, { type Player } from "./PlayerCard";

const activePlayer: Player = {
  name: "山田 太郎",
  ig: "@taro_yamada_pb",
  bio: "元テニスプレーヤー。2024年よりピックルボールに転向。",
};

const comingSoonPlayer: Player = {
  name: "Coming Soon",
  ig: "",
  bio: "",
};

function renderCard(player: Player) {
  return render(
    <NextIntlClientProvider locale="ja" messages={jaMessages}>
      <PlayerCard player={player} />
    </NextIntlClientProvider>
  );
}

describe("PlayerCard", () => {
  it("選手名を表示する", () => {
    renderCard(activePlayer);
    expect(screen.getByText(activePlayer.name)).toBeInTheDocument();
  });

  it("IGハンドルを表示する", () => {
    renderCard(activePlayer);
    expect(screen.getByText(activePlayer.ig)).toBeInTheDocument();
  });

  it("bioを表示する", () => {
    renderCard(activePlayer);
    expect(screen.getByText(activePlayer.bio)).toBeInTheDocument();
  });

  it("Photoプレースホルダを表示する", () => {
    renderCard(activePlayer);
    expect(
      screen.getByText(jaMessages.About.photoPlaceholder)
    ).toBeInTheDocument();
  });

  it("ig / bio が空文字のときは IG と bio を描画しない", () => {
    renderCard(comingSoonPlayer);
    expect(screen.getByText(comingSoonPlayer.name)).toBeInTheDocument();
    expect(screen.queryByText(activePlayer.ig)).not.toBeInTheDocument();
    expect(screen.queryByText(activePlayer.bio)).not.toBeInTheDocument();
  });

  it("aspect-[4/3] の Photo 領域を持つ", () => {
    const { container } = renderCard(activePlayer);
    const photoArea = container.querySelector('.aspect-\\[4\\/3\\]');
    expect(photoArea).toBeInTheDocument();
  });

  it("image プロパティが指定されているときは画像を表示しプレースホルダは表示しない", () => {
    renderCard({
      ...activePlayer,
      image: "/images/yuta-yoshida.jpg",
      imageAlt: "吉田 裕太",
    });
    const img = screen.getByAltText("吉田 裕太");
    expect(img).toBeInTheDocument();
    expect(
      screen.queryByText(jaMessages.About.photoPlaceholder)
    ).not.toBeInTheDocument();
  });

  it("カード外枠に h-full を持ち高さ揃えに対応する", () => {
    const { container } = renderCard(activePlayer);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("h-full");
  });
});
