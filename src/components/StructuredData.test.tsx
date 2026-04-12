import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StructuredData from "./StructuredData";

describe("StructuredData", () => {
  it("1つのスキーマを <script type='application/ld+json'> として出力する", () => {
    const schema = { "@context": "https://schema.org", "@type": "Thing" };
    const { container } = render(<StructuredData data={schema} />);

    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(schema);
  });

  it("配列で複数スキーマを渡すと個別のscriptタグで出力する", () => {
    const schemas = [
      { "@context": "https://schema.org", "@type": "Organization" },
      { "@context": "https://schema.org", "@type": "WebSite" },
    ];
    const { container } = render(<StructuredData data={schemas} />);

    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts).toHaveLength(2);
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(schemas[0]);
    expect(JSON.parse(scripts[1].textContent ?? "")).toEqual(schemas[1]);
  });

  it("XSS対策: </script> を含むデータをエスケープして出力する", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "evil</script><script>alert(1)</script>",
    };
    const { container } = render(<StructuredData data={schema} />);

    const html = container.innerHTML;
    expect(html).not.toContain("</script><script>alert(1)");
  });
});
