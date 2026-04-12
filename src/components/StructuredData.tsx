type Schema = object;

interface StructuredDataProps {
  data: Schema | readonly Schema[];
}

function escapeJsonLd(json: string): string {
  return json.replace(/</g, "\\u003c");
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
