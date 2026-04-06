import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomeFacility from "./HomeFacility";

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

vi.mock("embla-carousel-autoplay", () => ({
  default: () => ({}),
}));

describe("HomeFacility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedScrollSnap.mockReturnValue(0);
    returnApi = mockEmblaApi;
  });

  it('セクションID "facility" を持つ', () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section).toBeInTheDocument();
  });

  it("キーナンバーを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("COURTS")).toBeInTheDocument();
    expect(screen.getByText("6:00–23:00")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("1 min")).toBeInTheDocument();
    expect(screen.getByText("FROM STATION")).toBeInTheDocument();
  });

  it("Primary Specsを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("SURFACE")).toBeInTheDocument();
    expect(screen.getByText("ハードコート DecoTurf（デコターフ）")).toBeInTheDocument();
    expect(screen.getByText("TYPE")).toBeInTheDocument();
    expect(screen.getByText("全天候型インドア")).toBeInTheDocument();
  });

  it("DecoTurf説明文を表示する", () => {
    render(<HomeFacility />);
    expect(
      screen.getByText(/DecoTurf（デコターフ）は、世界最大級のピックルボール大会/)
    ).toBeInTheDocument();
  });

  it("全設備項目を表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("トレーニングエリア")).toBeInTheDocument();
    expect(screen.getByText("ラウンジスペース")).toBeInTheDocument();
    expect(screen.getByText("男女別更衣室")).toBeInTheDocument();
    expect(screen.getByText("空調完備")).toBeInTheDocument();
    expect(screen.getByText("自動販売機")).toBeInTheDocument();
    expect(screen.getByText("レンタル用具あり")).toBeInTheDocument();
    expect(screen.getByText("無人チェックイン対応予定")).toBeInTheDocument();
    expect(screen.getByText("ショーコート1面に変更可能")).toBeInTheDocument();
  });

  it("トレーニングエリアとラウンジスペースに準備中の注記を表示する", () => {
    render(<HomeFacility />);
    const notes = screen.getAllByText("準備中");
    expect(notes).toHaveLength(2);
  });

  it("FACILITY タイトルを表示する", () => {
    render(<HomeFacility />);
    expect(screen.getByText("FACILITY")).toBeInTheDocument();
  });

  it("bg-deep-black 背景クラスを持つ", () => {
    render(<HomeFacility />);
    const section = document.getElementById("facility");
    expect(section?.className).toContain("bg-deep-black");
  });

  it("カルーセルのドットインジケーターを表示する", () => {
    render(<HomeFacility />);
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    expect(dots).toHaveLength(3);
  });

  it("全施設画像をレンダリングする", () => {
    render(<HomeFacility />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it("ドットクリックでscrollToが呼ばれる", () => {
    render(<HomeFacility />);
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    fireEvent.click(dots[1]);
    expect(mockScrollTo).toHaveBeenCalledWith(1);
  });

  it("emblaApiのselectイベントを登録する", () => {
    render(<HomeFacility />);
    expect(mockOn).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("selectコールバックでselectedScrollSnapを呼ぶ", () => {
    render(<HomeFacility />);
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
    render(<HomeFacility />);
    const prevBtn = screen.getByRole("button", { name: "前の画像" });
    fireEvent.click(prevBtn);
    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it("次の画像ボタンでscrollNextが呼ばれる", () => {
    render(<HomeFacility />);
    const nextBtn = screen.getByRole("button", { name: "次の画像" });
    fireEvent.click(nextBtn);
    expect(mockScrollNext).toHaveBeenCalled();
  });

  it("emblaApiがnullの時にscrollToが何もしない", () => {
    returnApi = null;
    render(<HomeFacility />);
    const dots = screen.getAllByRole("button", { name: /画像.*を表示/ });
    fireEvent.click(dots[1]);
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("emblaApiがnullの時に矢印ボタンが何もしない", () => {
    returnApi = null;
    render(<HomeFacility />);
    fireEvent.click(screen.getByRole("button", { name: "前の画像" }));
    fireEvent.click(screen.getByRole("button", { name: "次の画像" }));
    expect(mockScrollPrev).not.toHaveBeenCalled();
    expect(mockScrollNext).not.toHaveBeenCalled();
  });

  it("emblaApiがnullの時にイベント登録しない", () => {
    returnApi = null;
    render(<HomeFacility />);
    expect(mockOn).not.toHaveBeenCalled();
  });
});
