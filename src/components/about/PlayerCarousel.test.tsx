import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../messages/ja.json";

const mockScrollTo = vi.fn();
const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();
const mockSelectedScrollSnap = vi.fn(() => 0);
const mockOn = vi.fn();
const mockOff = vi.fn();

const mockEmblaApi = {
  scrollTo: mockScrollTo,
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  on: mockOn,
  off: mockOff,
};

let returnApi: typeof mockEmblaApi | null = mockEmblaApi;

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), returnApi],
}));

import PlayerCarousel from "./PlayerCarousel";
import type { Player } from "./PlayerCard";

const ABOUT = jaMessages.About;
const PLAYERS = ABOUT.players;
const CAROUSEL = PLAYERS.carousel;

const defaultPlayers: Player[] = [
  {
    name: PLAYERS.playerName,
    ig: PLAYERS.playerIg,
    bio: PLAYERS.playerBio,
  },
  {
    name: PLAYERS.comingSoon,
    ig: "",
    bio: "",
  },
];

function renderCarousel(players: Player[] = defaultPlayers) {
  return render(
    <NextIntlClientProvider locale="ja" messages={jaMessages}>
      <PlayerCarousel players={players} />
    </NextIntlClientProvider>
  );
}

describe("PlayerCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedScrollSnap.mockReturnValue(0);
    returnApi = mockEmblaApi;
  });

  it("選手名とComing Soonを含むカードを表示する", () => {
    renderCarousel();
    expect(screen.getByText(PLAYERS.playerName)).toBeInTheDocument();
    expect(screen.getByText(PLAYERS.playerIg)).toBeInTheDocument();
    expect(screen.getByText(PLAYERS.comingSoon)).toBeInTheDocument();
  });

  it("Photoプレースホルダを2枚描画する", () => {
    renderCarousel();
    const photos = screen.getAllByText(ABOUT.photoPlaceholder);
    expect(photos.length).toBe(2);
  });

  it("前/次ボタンが描画されている", () => {
    renderCarousel();
    expect(
      screen.getByRole("button", { name: CAROUSEL.prev })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: CAROUSEL.next })
    ).toBeInTheDocument();
  });

  it("カルーセル領域にARIAランドマークが付与されている", () => {
    const { container } = renderCarousel();
    const carousel = container.querySelector('[aria-roledescription="carousel"]');
    expect(carousel).toBeInTheDocument();
    expect(carousel?.getAttribute("aria-label")).toBe(CAROUSEL.regionLabel);
  });

  it("各スライドにrole=group + aria-roledescription=slide + aria-label=N/Mが付与されている", () => {
    const { container } = renderCarousel();
    const slides = container.querySelectorAll('[aria-roledescription="slide"]');
    expect(slides.length).toBe(2);
    expect(slides[0].getAttribute("role")).toBe("group");
    expect(slides[0].getAttribute("aria-label")).toBe("1 / 2");
    expect(slides[1].getAttribute("aria-label")).toBe("2 / 2");
  });

  it("ドットボタンが選手数と同じ数描画される", () => {
    renderCarousel();
    const dotButtons = screen
      .getAllByRole("button")
      .filter((b) => (b.getAttribute("aria-label") || "").includes("を表示"));
    expect(dotButtons.filter((b) => b.getAttribute("aria-label")?.includes("枚目")).length).toBe(
      2
    );
  });

  it("次ボタンクリックでscrollNextが呼ばれる", () => {
    renderCarousel();
    fireEvent.click(screen.getByRole("button", { name: CAROUSEL.next }));
    expect(mockScrollNext).toHaveBeenCalled();
  });

  it("前ボタンクリックでscrollPrevが呼ばれる", () => {
    renderCarousel();
    fireEvent.click(screen.getByRole("button", { name: CAROUSEL.prev }));
    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it("ドットクリックでscrollToが呼ばれる", () => {
    renderCarousel();
    const dots = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.includes("枚目"));
    fireEvent.click(dots[1]);
    expect(mockScrollTo).toHaveBeenCalledWith(1);
  });

  it("emblaApiのselectイベントを登録する", () => {
    renderCarousel();
    expect(mockOn).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("選択時にアクティブドットのクラスが切り替わる", () => {
    mockSelectedScrollSnap.mockReturnValue(1);
    renderCarousel();
    const dots = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.includes("枚目"));
    expect(dots[0].className).not.toContain("bg-accent");
    expect(dots[1].className).toContain("bg-accent");
    expect(dots[1].className).toContain("scale-125");
  });

  it("アンマウント時にemblaApi.offでリスナーを解除する", () => {
    const { unmount } = renderCarousel();
    unmount();
    expect(mockOff).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("emblaApiがnullのときはscrollToが何もしない", () => {
    returnApi = null;
    renderCarousel();
    const dots = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.includes("枚目"));
    fireEvent.click(dots[1]);
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("emblaApiがnullのとき矢印ボタンが何もしない", () => {
    returnApi = null;
    renderCarousel();
    fireEvent.click(screen.getByRole("button", { name: CAROUSEL.next }));
    fireEvent.click(screen.getByRole("button", { name: CAROUSEL.prev }));
    expect(mockScrollNext).not.toHaveBeenCalled();
    expect(mockScrollPrev).not.toHaveBeenCalled();
  });

  it("emblaApiがnullのときはイベント登録しない", () => {
    returnApi = null;
    renderCarousel();
    expect(mockOn).not.toHaveBeenCalled();
  });
});
