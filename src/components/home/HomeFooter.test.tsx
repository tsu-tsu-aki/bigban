import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import HomeFooter from "./HomeFooter";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
      />
    );
  },
}));

describe("HomeFooter", () => {
  it("footer要素が存在する", () => {
    render(<HomeFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("ロゴ画像を表示する", () => {
    render(<HomeFooter />);
    expect(
      screen.getByAltText("THE PICKLE BANG THEORY")
    ).toBeInTheDocument();
  });

  it("6つのナビリンクを表示する", () => {
    render(<HomeFooter />);
    const links = [
      { name: "CONCEPT", href: "#concept" },
      { name: "FACILITY", href: "#facility" },
      { name: "SERVICES", href: "#services" },
      { name: "PRICING", href: "#pricing" },
      { name: "ACCESS", href: "#access" },
      { name: "CONTACT", href: "#contact" },
    ];

    for (const link of links) {
      const el = screen.getByRole("link", { name: link.name });
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("href", link.href);
    }
  });

  it("コピーライトを表示する", () => {
    render(<HomeFooter />);
    expect(
      screen.getByText(/© 2026 RST Agency Inc\./)
    ).toBeInTheDocument();
  });

  it("住所を表示する", () => {
    render(<HomeFooter />);
    expect(screen.getByText(/〒272-0021/)).toBeInTheDocument();
  });

  it("アクセントセパレーターを持つ", () => {
    render(<HomeFooter />);
    const footer = screen.getByRole("contentinfo");
    const firstChild = footer.firstElementChild;
    expect(firstChild).not.toBeNull();
    expect(firstChild?.className).toContain("h-px");
  });
});
