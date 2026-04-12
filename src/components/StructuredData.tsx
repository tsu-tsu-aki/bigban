type Schema = { readonly "@context": string; readonly "@type": string };

interface StructuredDataProps {
  data: Schema | readonly Schema[];
}

function escapeJsonLd(json: string): string {
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: escapeJsonLd(JSON.stringify(schema)),
          }}
        />
      ))}
    </>
  );
}
