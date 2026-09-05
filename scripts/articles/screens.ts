import { p, h2, quote, type ArticleSeed, type Content } from "./builders";

/**
 * الشاشات في السنة الأولى — الانتباه ليس تعلّمًا.
 *
 * ⚠️ العبرية والإنجليزية ترجمة آلية لمحتوى صحّي — تحتاج مراجعة بشرية
 * قبل الاعتماد.
 */

const AR: Content = {
  title: "الشاشات في السنة الأولى: هل يتعلم الطفل منها؟",
  excerpt:
    "قد يبدو الرضيع مركّزًا جدًا فيما يشاهده — لكن الانتباه للشاشة ليس تعلّمًا. ماذا توصي منظمة الصحة العالمية، ولماذا تُستثنى مكالمات الفيديو وحدها؟",
  body: [
    p(
      "قد ينجذب الرضيع للألوان، الحركة والأصوات على الشاشة، وقد يبدو مركّزًا جدًا فيما يشاهده. لكن ",
      ["الانتباه للشاشة لا يعني بالضرورة أن الطفل يتعلم منها", "strong"],
      "."
    ),
    p(
      "خلال السنة الأولى، يتعلم الطفل بشكل أساسي من التفاعل المباشر مع الأشخاص والبيئة المحيطة به: يسمع صوت أهله، يراقب تعابير وجوههم، يُصدر صوتًا فيتلقّى استجابة، ويمسك الأشياء ويحرّكها ويستكشفها."
    ),

    h2("ماذا تقول التوصيات العالمية؟"),
    p(
      "توصي ",
      ["منظمة الصحة العالمية (WHO)", "strong"],
      " بعدم إعطاء الرضّع تحت عمر سنة وقتًا خاملًا أمام الشاشات."
    ),
    p(
      "وتوضّح ",
      ["الأكاديمية الأمريكية لطب الأطفال (AAP)", "strong"],
      " أن الأطفال تحت عمر السنتين يحتاجون إلى الاستكشاف العملي والتفاعل الاجتماعي لتطوير المهارات المعرفية واللغوية والحركية والاجتماعية. كما أن قدرتهم على التعلم من المحتوى ثنائي الأبعاد ونقل ما شاهدوه إلى العالم الحقيقي ما زالت محدودة في هذه المرحلة."
    ),
    p(
      "لذلك، حتى لو وُصف الفيديو بأنه «تعليمي»، فهو لا يقدّم للرضيع نفس نوع التعلم الذي يحصل عليه من التفاعل الحقيقي."
    ),

    h2("الشاشة لا تأخذ وقتًا فقط"),
    p(
      "عند الحديث عن الشاشات، لا ننظر فقط إلى محتواها أو عدد الدقائق أمامها، بل إلى ",
      ["التجارب التي قد تحلّ الشاشة مكانها", "strong"],
      "."
    ),
    p(
      "فالوقت أمام الشاشة قد يكون على حساب الحديث مع الطفل، اللعب، الحركة، استكشاف الأشياء، القراءة والتواصل البصري. وهذه التجارب تشكّل جزءًا أساسيًا من تطوّره خلال السنة الأولى."
    ),

    h2("هل مكالمات الفيديو مختلفة؟"),
    p(
      "نعم. تُعتبر ",
      ["مكالمات الفيديو التفاعلية", "strong"],
      " مختلفة عن المشاهدة السلبية، لأنها تسمح بتفاعل اجتماعي حقيقي: شخص يتحدث مع الطفل، ينتظر استجابته ويردّ على أصواته وحركاته."
    ),
    p(
      "ولهذا تستثني الأكاديمية الأمريكية لطب الأطفال مكالمات الفيديو التفاعلية من توصيتها بتجنّب استخدام الشاشات لدى الأطفال الأصغر من 18 شهرًا."
    ),

    h2("ماذا يحتاج الطفل بدلًا من الشاشة؟"),
    p(
      "لا يحتاج الرضيع إلى أنشطة تعليمية معقّدة. الحديث معه، الغناء، قراءة كتاب، اللعب على الأرض، تقليد أصواته وإعطاؤه أشياء آمنة ليستكشفها — كلها فرص حقيقية للتعلم."
    ),
    quote(
      "في السنة الأولى، الطفل لا يحتاج إلى شاشة لتعلّمه عن العالم؛ يحتاج إلى فرصة ليعيشه ويتفاعل معه."
    ),
  ],
};

const HE: Content = {
  title: "מסכים בשנה הראשונה: האם התינוק לומד מהם?",
  excerpt:
    "התינוק עשוי להיראות מרוכז מאוד במה שהוא רואה — אך תשומת לב למסך אינה למידה. מה ממליץ ארגון הבריאות העולמי, ומדוע שיחות הווידאו הן החריג היחיד?",
  body: [
    p(
      "התינוק עשוי להימשך לצבעים, לתנועה ולצלילים שעל המסך, ולהיראות מרוכז מאוד במה שהוא רואה. אך ",
      ["תשומת לב למסך אינה מעידה בהכרח שהתינוק לומד ממנו", "strong"],
      "."
    ),
    p(
      "בשנה הראשונה התינוק לומד בעיקר מאינטראקציה ישירה עם האנשים ועם הסביבה סביבו: הוא שומע את קול הוריו, מתבונן בהבעות פניהם, משמיע קול ומקבל תגובה, אוחז בחפצים, מזיז אותם וחוקר אותם."
    ),

    h2("מה אומרות ההמלצות הבינלאומיות?"),
    p(
      ["ארגון הבריאות העולמי (WHO)", "strong"],
      " ממליץ שלא לתת לתינוקות מתחת לגיל שנה זמן מסך פסיבי."
    ),
    p(
      ["האקדמיה האמריקאית לרפואת ילדים (AAP)", "strong"],
      " מבהירה שילדים מתחת לגיל שנתיים זקוקים לחקירה מעשית ולאינטראקציה חברתית כדי לפתח מיומנויות קוגניטיביות, לשוניות, מוטוריות וחברתיות. גם היכולת שלהם ללמוד מתוכן דו-ממדי ולהעביר את מה שראו אל העולם האמיתי עדיין מוגבלת בשלב הזה."
    ),
    p(
      "לכן, גם אם הסרטון מתואר כ«חינוכי», הוא אינו מספק לתינוק את סוג הלמידה שהוא מקבל מאינטראקציה אמיתית."
    ),

    h2("המסך לא לוקח רק זמן"),
    p(
      "כשמדברים על מסכים, לא בוחנים רק את התוכן או את מספר הדקות מולו, אלא גם את ",
      ["החוויות שהמסך עלול לבוא במקומן", "strong"],
      "."
    ),
    p(
      "זמן מול מסך עלול לבוא על חשבון שיחה עם התינוק, משחק, תנועה, חקירת חפצים, קריאה וקשר עין. החוויות האלה הן חלק מהותי מהתפתחותו בשנה הראשונה."
    ),

    h2("והאם שיחות וידאו שונות?"),
    p(
      "כן. ",
      ["שיחות וידאו אינטראקטיביות", "strong"],
      " שונות מצפייה פסיבית, משום שהן מאפשרות אינטראקציה חברתית אמיתית: אדם מדבר עם התינוק, ממתין לתגובתו ומשיב לקולותיו ולתנועותיו."
    ),
    p(
      "משום כך האקדמיה האמריקאית לרפואת ילדים מחריגה שיחות וידאו אינטראקטיביות מההמלצה להימנע ממסכים אצל ילדים מתחת לגיל 18 חודשים."
    ),

    h2("למה התינוק זקוק במקום המסך?"),
    p(
      "התינוק אינו זקוק לפעילויות חינוכיות מורכבות. שיחה איתו, שירה, קריאת ספר, משחק על הרצפה, חיקוי קולותיו ומתן חפצים בטוחים לחקירה — כל אלה הזדמנויות למידה אמיתיות."
    ),
    quote(
      "בשנה הראשונה התינוק אינו זקוק למסך שילמד אותו על העולם; הוא זקוק להזדמנות לחיות אותו ולתקשר איתו."
    ),
  ],
};

const EN: Content = {
  title: "Screens in the first year: does a baby learn from them?",
  excerpt:
    "A baby can look completely absorbed in a screen — but attention is not learning. What the World Health Organization advises, and why video calls are the one exception.",
  body: [
    p(
      "A baby may be drawn to the colours, movement and sounds on a screen, and can look intensely focused on what they are watching. But ",
      ["attention to a screen does not mean a baby is learning from it", "strong"],
      "."
    ),
    p(
      "Through the first year, a baby learns mainly from direct interaction with people and the world around them: hearing their parents' voices, watching their faces, making a sound and getting a response, holding objects and moving and exploring them."
    ),

    h2("What do the international recommendations say?"),
    p(
      "The ",
      ["World Health Organization (WHO)", "strong"],
      " recommends no sedentary screen time for infants under one year of age."
    ),
    p(
      "The ",
      ["American Academy of Pediatrics (AAP)", "strong"],
      " explains that children under two need hands-on exploration and social interaction to develop cognitive, language, motor and social skills. Their ability to learn from two-dimensional content and carry what they saw across into the real world is still limited at this stage."
    ),
    p(
      "So even when a video is described as \"educational\", it does not give a baby the kind of learning that real interaction does."
    ),

    h2("A screen does not only take time"),
    p(
      "When we talk about screens, we look not only at the content or the number of minutes, but at ",
      ["the experiences a screen may replace", "strong"],
      "."
    ),
    p(
      "Screen time can come at the cost of talking with the baby, play, movement, exploring objects, reading and eye contact. Those experiences are a core part of development in the first year."
    ),

    h2("Are video calls different?"),
    p(
      "Yes. ",
      ["Interactive video calls", "strong"],
      " differ from passive watching, because they allow real social interaction: someone talks to the baby, waits for a response, and answers their sounds and movements."
    ),
    p(
      "That is why the American Academy of Pediatrics exempts interactive video calls from its recommendation to avoid screens for children under 18 months."
    ),

    h2("What does a baby need instead?"),
    p(
      "A baby does not need elaborate educational activities. Talking to them, singing, reading a book, playing on the floor, mirroring their sounds and handing them safe objects to explore — these are all genuine chances to learn."
    ),
    quote(
      "In the first year a baby does not need a screen to teach them about the world; they need the chance to live in it and respond to it."
    ),
  ],
};

/** المصادر لا تُترجَم — أسماء المؤسسات والدوريات تبقى بلغتها */
const SOURCES = [
  "World Health Organization (WHO). Guidelines on Physical Activity, Sedentary Behaviour and Sleep for Children under 5 Years of Age.",
  "American Academy of Pediatrics (AAP). Media and Young Minds. Pediatrics.",
  "American Academy of Pediatrics (AAP). Screen Time for Infants. HealthyChildren.org.",
];

export const screens: ArticleSeed = {
  id: "article-screens-first-year",
  slug: "screens-first-year",
  category: "development",
  sources: SOURCES,
  content: { ar: AR, he: HE, en: EN },
};
