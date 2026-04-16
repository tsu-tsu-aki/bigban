import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import jaMessages from "../../../messages/ja.json";
import { setMockUseInView } from "../../../__mocks__/framer-motion";
import HomeFacility from "./HomeFacility";

const mockScrollTo = vi.fn();
const mockScrollPrev = vi.fn();
const mockScrollNext = vi.fn();
const mockSelectedScrollSnap = vi.fn(() => 0);
const mockOn = vi.fn();
const mockOff = vi.fn();
const mockAutoplayPlay = vi.fn();
const mockAutoplayStop = vi.fn();

const mockEmblaApi = {
  scrollTo: mockScrollTo,
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  on: mockOn,
  off: mockOff,
  plugins: vi.fn(() => ({
    autoplay: {
      play: mockAutoplayPlay,
      stop: mockAutoplayStop,
    },
  })),
};

let returnApi: typeof mockEmblaApi | null = mockEmblaApi;

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), returnApi],
}));

const mockAutoplayFactory = vi.fn(() => ({}));
vi.mock("embla-carousel-autoplay", () => ({
  default: mockAutoplayFactory,
}));

describe("HomeFacility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedScrollSnap.mockReturnValue(0);
    returnApi = mockEmblaApi;
    setMockUseInView(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('セクションID "facility" を持つ', () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const section = document.getElementById("facility");
    expect(section).toBeInTheDocument();
  });

  it("キーナンバーを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("COURTS")).toBeInTheDocument();
    expect(screen.getByText("6:00–23:00")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("1 min")).toBeInTheDocument();
    expect(screen.getByText("FROM STATION")).toBeInTheDocument();
  });

  it("Primary Specsを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("SURFACE")).toBeInTheDocument();
    expect(screen.getByText("ハードコート DecoTurf（デコターフ）")).toBeInTheDocument();
    expect(screen.getByText("TYPE")).toBeInTheDocument();
    expect(screen.getByText("全天候型インドア")).toBeInTheDocument();
  });

  it("DecoTurf説明文を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(
      screen.getByText(/DecoTurf（デコターフ）は、世界最大級のピックルボール大会/)
    ).toBeInTheDocument();
  });

  it("全設備項目を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("トレーニングエリア")).toBeInTheDocument();
    expect(screen.getByText("ラウンジスペース")).toBeInTheDocument();
    expect(screen.getByText("男女別更衣室")).toBeInTheDocument();
    expect(screen.getByText("空調完備")).toBeInTheDocument();
    expect(screen.getByText("自動販売機")).toBeInTheDocument();
    expect(screen.getByText("レンタル用具あり")).toBeInTheDocument();
    expect(screen.getByText("無人チェックイン対応")).toBeInTheDocument();
    expect(screen.getByText("ショーコート1面に変更可能")).toBeInTheDocument();
  });

  it("トレーニングエリアとラウンジスペースに準備中の注記を表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const notes = screen.getAllByText("準備中");
    expect(notes).toHaveLength(2);
  });

  it("FACILITY タイトルを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(screen.getByText("FACILITY")).toBeInTheDocument();
  });

  it("bg-deep-black 背景クラスを持つ", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const section = document.getElementById("facility");
    expect(section?.className).toContain("bg-deep-black");
  });

  it("カルーセルのドットインジケーターを表示する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    expect(dots).toHaveLength(3);
  });

  it("全施設画像をレンダリングする", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it("ドットクリックでscrollToが呼ばれる", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    fireEvent.click(dots[1]);
    expect(mockScrollTo).toHaveBeenCalledWith(1);
  });

  it("emblaApiのselectイベントを登録する", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(mockOn).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("selectコールバックでselectedScrollSnapを呼ぶ", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const selectCall = mockOn.mock.calls.find(
      (call) => call[0] === "select"
    );
    const selectCallback = selectCall?.[1] as (() => void) | undefined;
    expect(selectCallback).toBeDefined();
    mockSelectedScrollSnap.mockReturnValue(2);
    selectCallback!();
    expect(mockSelectedScrollSnap).toHaveBeenCalled();
  });

  it("前の画像ボタンでscrollPrevが呼ばれる", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const prevBtn = screen.getByRole("button", { name: "前の画像" });
    fireEvent.click(prevBtn);
    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it("次の画像ボタンでscrollNextが呼ばれる", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const nextBtn = screen.getByRole("button", { name: "次の画像" });
    fireEvent.click(nextBtn);
    expect(mockScrollNext).toHaveBeenCalled();
  });

  it("emblaApiがnullの時にscrollToが何もしない", () => {
    returnApi = null;
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    fireEvent.click(dots[1]);
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("emblaApiがnullの時に矢印ボタンが何もしない", () => {
    returnApi = null;
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "前の画像" }));
    fireEvent.click(screen.getByRole("button", { name: "次の画像" }));
    expect(mockScrollPrev).not.toHaveBeenCalled();
    expect(mockScrollNext).not.toHaveBeenCalled();
  });

  it("emblaApiがnullの時にイベント登録しない", () => {
    returnApi = null;
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(mockOn).not.toHaveBeenCalled();
  });

  it("AutoplayにplayOnInit: falseを渡す", () => {
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(mockAutoplayFactory).toHaveBeenCalledWith(
      expect.objectContaining({ playOnInit: false })
    );
  });

  it("ビューポートに入った時にautoplay.play()が呼ばれる", () => {
    setMockUseInView(true);
    render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(mockAutoplayPlay).toHaveBeenCalled();
  });

  it("ビューポートから出た時にautoplay.stop()が呼ばれる", () => {
    setMockUseInView(true);
    const { rerender } = render(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    vi.clearAllMocks();
    setMockUseInView(false);
    rerender(
      <NextIntlClientProvider locale="ja" messages={jaMessages}>
        <HomeFacility />
      </NextIntlClientProvider>
    );
    expect(mockAutoplayStop).toHaveBeenCalled();
  });

  it("emblaApiがnullの時にビューポート検知でエラーにならない", () => {
    returnApi = null;
    setMockUseInView(true);
    expect(() => {
      render(
        <NextIntlClientProvider locale="ja" messages={jaMessages}>
          <HomeFacility />
        </NextIntlClientProvider>
      );
    }).not.toThrow();
    expect(mockAutoplayPlay).not.toHaveBeenCalled();
  });
});
