import { p, h2, quote, type ArticleSeed, type Content } from "./builders";

/**
 * القراءة للطفل منذ الولادة — قيمتها في اللغة والتفاعل لا في فهم القصة.
 *
 * النص العربي كما وصل، والتشديد مكان المائل في الأصل (الخط العربي لا مائل له).
 * ⚠️ العبرية والإنجليزية ترجمة آلية لمحتوى صحّي — تحتاج مراجعة بشرية
 * قبل الاعتماد.
 */

const AR: Content = {
  title: "القراءة للطفل منذ الولادة وأثرها على تطوره",
  excerpt:
    "الرضيع لا يفهم القصة بعد، لكن القراءة له منذ الولادة تعرّضه للغة وتقرّبه من أهله. كيف نقرأ لطفل في سنته الأولى، ولماذا تكفي بضع دقائق؟",
  body: [
    p(
      "قد يبدو أن القراءة لطفل في أسابيعه أو أشهره الأولى أمر مبكر، فهو لا يفهم أحداث القصة أو معاني الكلمات بعد. لكن في هذه المرحلة، لا تكمن أهمية القراءة في فهم القصة نفسها، بل في ",
      ["اللغة والتفاعل والتواصل الذي يحدث أثناءها", "strong"],
      "."
    ),
    p("يمكن البدء بالقراءة للطفل منذ الولادة، لتصبح تدريجيًا جزءًا طبيعيًا من يومه ومن بيئته."),

    h2("اللغة تبدأ قبل الكلام"),
    p(
      "قبل أن ينطق الطفل كلمته الأولى بوقت طويل، يبدأ بالتعرف إلى الأصوات ونبرة الكلام وإيقاع اللغة من حوله."
    ),
    p(
      "القراءة بصوت عالٍ تعرّض الطفل للكلمات والأصوات بشكل متكرر، وتدعم تطور اللغة والمهارات المعرفية والاجتماعية والعاطفية."
    ),
    p(
      "كما أن فائدتها لا تقتصر على الكلمات؛ فوجود الطفل قريبًا من أهله، وسماع صوتهم، ومراقبة تعابير وجوههم والاستجابة لأصواته وحركاته، يجعل القراءة فرصة للتواصل وبناء العلاقة أيضًا."
    ),

    h2("الكتاب ليس مجرد قصة"),
    p("خلال السنة الأولى، لا نحتاج إلى إنهاء القصة أو قراءة النص حرفيًا."),
    p(
      "يمكن التوقف عند صورة، تسميتها، تقليد صوت حيوان، تغيير نبرة الصوت أو الرد عندما يصدر الطفل صوتًا. ومع تقدمه في العمر، يمكن تركه يلمس الكتاب ويحاول تقليب الصفحات والإشارة إلى الصور."
    ),
    p(
      "بهذه الطريقة يصبح الكتاب ",
      ["وسيلة للتفاعل واستكشاف اللغة", "strong"],
      "، وليس نشاطًا يحتاج الطفل إلى الجلوس والاستماع إليه بصمت."
    ),

    h2("بضع دقائق تكفي"),
    p(
      "لا يحتاج الرضيع إلى جلسات قراءة طويلة أو إلى مجموعة كبيرة من الكتب. يمكن البدء ببضع دقائق في وقت يكون فيه هادئًا ومستعدًا للتفاعل."
    ),
    p(
      "في الأشهر الأولى تناسبه الكتب البسيطة ذات الصور الواضحة، ثم تتغير طريقة تفاعله مع الكتب تدريجيًا؛ من الاستماع والنظر، إلى اللمس والإشارة ومحاولة تقليب الصفحات."
    ),
    p("الأهم هو أن تكون تجربة القراءة ممتعة ومتكررة، وليست مهمة يجب إنهاؤها."),

    h2("الخلاصة"),
    p(
      "لا يحتاج الطفل إلى فهم القصة حتى يستفيد من القراءة. فمنذ الأشهر الأولى، تمنحه الكتب فرصة لسماع اللغة، والتفاعل مع أهله، والتعرف تدريجيًا إلى الكلمات والصور."
    ),
    quote(
      "قبل أن يتعلم الطفل قراءة الكتب بسنوات، تبدأ الكتب بالمساهمة في بناء علاقته باللغة والتواصل."
    ),
  ],
};

const HE: Content = {
  title: "קריאה לתינוק מהלידה והשפעתה על התפתחותו",
  excerpt:
    "התינוק עוד לא מבין את הסיפור, אבל קריאה לו מהלידה חושפת אותו לשפה ומקרבת אותו להוריו. איך קוראים לתינוק בשנה הראשונה, ולמה כמה דקות מספיקות?",
  body: [
    p(
      "קריאה לתינוק בשבועות או בחודשים הראשונים לחייו עשויה להיראות מוקדמת מדי — הוא עוד לא מבין את עלילת הסיפור או את משמעות המילים. אבל בשלב הזה, חשיבות הקריאה אינה בהבנת הסיפור עצמו, אלא ",
      ["בשפה, באינטראקציה ובתקשורת שמתרחשות במהלכה", "strong"],
      "."
    ),
    p("אפשר להתחיל לקרוא לתינוק כבר מהלידה, כך שהקריאה תהפוך בהדרגה לחלק טבעי מהיום שלו ומהסביבה שלו."),

    h2("השפה מתחילה לפני הדיבור"),
    p(
      "הרבה לפני שהתינוק אומר את המילה הראשונה שלו, הוא מתחיל להכיר את הצלילים, את טון הדיבור ואת המקצב של השפה סביבו."
    ),
    p(
      "קריאה בקול חושפת את התינוק למילים ולצלילים באופן חוזר, ותומכת בהתפתחות השפה ובמיומנויות קוגניטיביות, חברתיות ורגשיות."
    ),
    p(
      "והתועלת אינה מסתכמת במילים: הקרבה להוריו, שמיעת קולם, ההתבוננות בהבעות פניהם והתגובה לקולותיו ולתנועותיו הופכות את הקריאה גם להזדמנות לתקשורת ולבניית הקשר."
    ),

    h2("ספר הוא לא רק סיפור"),
    p("במהלך השנה הראשונה אין צורך לסיים את הסיפור או לקרוא את הטקסט מילה במילה."),
    p(
      "אפשר לעצור ליד תמונה, לומר מה רואים בה, לחקות קול של חיה, לשנות את טון הקול או להגיב כשהתינוק משמיע קול. וככל שהוא גדל, אפשר לתת לו לגעת בספר, לנסות להפוך דפים ולהצביע על התמונות."
    ),
    p(
      "כך הספר הופך ",
      ["לכלי לאינטראקציה ולגילוי השפה", "strong"],
      ", ולא לפעילות שבה התינוק צריך לשבת ולהקשיב בשקט."
    ),

    h2("כמה דקות מספיקות"),
    p(
      "תינוק אינו זקוק לזמני קריאה ארוכים או לאוסף גדול של ספרים. אפשר להתחיל בכמה דקות, בזמן שבו הוא רגוע ופנוי לאינטראקציה."
    ),
    p(
      "בחודשים הראשונים מתאימים לו ספרים פשוטים עם תמונות ברורות, ובהדרגה משתנה הדרך שבה הוא משתתף בקריאה: מהקשבה והתבוננות, אל מגע, הצבעה וניסיון להפוך דפים."
    ),
    p("העיקר שחוויית הקריאה תהיה מהנה וחוזרת, ולא משימה שצריך לסיים."),

    h2("לסיכום"),
    p(
      "התינוק אינו צריך להבין את הסיפור כדי להפיק תועלת מהקריאה. כבר מהחודשים הראשונים, ספרים נותנים לו הזדמנות לשמוע שפה, לתקשר עם הוריו ולהכיר בהדרגה מילים ותמונות."
    ),
    quote(
      "שנים לפני שהתינוק ילמד לקרוא ספרים, הספרים כבר מתחילים לבנות את הקשר שלו לשפה ולתקשורת."
    ),
  ],
};

const EN: Content = {
  title: "Reading to your baby from birth, and how it shapes development",
  excerpt:
    "A newborn cannot follow a story yet — but reading aloud from birth surrounds them with language and brings them close to their parents. How to read with a baby in the first year, and why a few minutes are enough.",
  body: [
    p(
      "Reading to a baby in their first weeks or months can seem premature — they do not yet follow the story or understand what the words mean. But at this stage, the value of reading is not in understanding the story itself; it lies in ",
      ["the language, interaction and connection that happen along the way", "strong"],
      "."
    ),
    p("You can start reading to your baby from birth, so that it gradually becomes a natural part of their day and their surroundings."),

    h2("Language begins before speech"),
    p(
      "Long before a baby says their first word, they begin to recognise sounds, the tone of speech and the rhythm of the language around them."
    ),
    p(
      "Reading aloud exposes a baby to words and sounds again and again, and supports the development of language as well as cognitive, social and emotional skills."
    ),
    p(
      "And the benefit is not only in the words: being close to their parents, hearing their voices, watching their faces and having their own sounds and movements answered makes reading a chance to connect and build the relationship, too."
    ),

    h2("A book is more than a story"),
    p("During the first year there is no need to finish the story or read the text word for word."),
    p(
      "You can pause at a picture, name it, imitate an animal sound, change your tone of voice, or respond when the baby makes a sound. As they grow, you can let them touch the book, try to turn the pages and point at the pictures."
    ),
    p(
      "This way the book becomes ",
      ["a tool for interaction and for exploring language", "strong"],
      ", not an activity the baby has to sit through and listen to in silence."
    ),

    h2("A few minutes are enough"),
    p(
      "A baby does not need long reading sessions or a large collection of books. You can start with a few minutes, at a time when they are calm and ready to engage."
    ),
    p(
      "In the first months, simple books with clear pictures suit them best; then the way they engage with books changes gradually — from listening and looking, to touching, pointing and trying to turn the pages."
    ),
    p("What matters most is that reading is enjoyable and repeated — not a task to be finished."),

    h2("In short"),
    p(
      "A baby does not need to understand the story to benefit from reading. From the first months, books give them the chance to hear language, interact with their parents, and gradually get to know words and pictures."
    ),
    quote(
      "Years before a child learns to read books, books have already begun building their relationship with language and connection."
    ),
  ],
};

/** المصادر لا تُترجَم — أسماء المؤسسات والدوريات تبقى بلغتها */
const SOURCES = [
  "American Academy of Pediatrics. Literacy Promotion: An Essential Component of Primary Care Pediatric Practice. Pediatrics, 2024.",
  "American Academy of Pediatrics. Early Literacy.",
  "UNICEF Parenting. Why It's Important to Read to Your Baby.",
];

export const reading: ArticleSeed = {
  id: "article-reading-from-birth",
  slug: "reading-to-baby-from-birth",
  category: "development",
  sources: SOURCES,
  content: { ar: AR, he: HE, en: EN },
  cover: {
    file: "scripts/articles/covers/reading-to-baby-from-birth.webp",
    alt: "أمّ تحتضن رضيعها وتقرأ له كتابًا مصوّرًا بالأبيض والأسود",
  },
};
