/**
 * بيانات منظَّمة (JSON-LD) لمحركات البحث — تُحقن نصًّا بلا أثر مرئي.
 * «<» يُهرَّب كي لا يغلق نصٌّ في البيانات وسمَ الـ script.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
