import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import InstagramIcon from "./InstagramIcon";

describe("InstagramIcon", () => {
  it("SVG要素を描画する", () => {
    const { container } = render(<InstagramIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("aria-hidden=trueで装飾扱いになっている", () => {
    const { container } = render(<InstagramIcon />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("ブランドグラデーションでfillを描画する", () => {
    const { container } = render(<InstagramIcon />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("fill")).toContain("url(#instagram-brand-gradient)");
    const gradient = container.querySelector("linearGradient");
    expect(gradient).toBeInTheDocument();
    const stops = container.querySelectorAll("stop");
    expect(stops.length).toBeGreaterThanOrEqual(3);
  });

  it("classNameを受け取って適用する", () => {
    const { container } = render(<InstagramIcon className="w-5 h-5" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("w-5");
    expect(svg?.getAttribute("class")).toContain("h-5");
  });
});
