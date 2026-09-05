import { p, h2, h3, li, quote, type ArticleSeed, type Content } from "./builders";

/**
 * التسنين — تمييز أعراضه الحقيقية عمّا يُنسب إليه خطأً.
 *
 * ⚠️ العبرية والإنجليزية ترجمة آلية لمحتوى صحّي — تحتاج مراجعة بشرية
 * قبل الاعتماد.
 */

const AR: Content = {
  title: "التسنين عند الأطفال: ما هي أعراضه الحقيقية؟",
  excerpt:
    "الحرارة والإسهال والبكاء الشديد تُنسب للتسنين كثيرًا — والأدلة لا تدعم ذلك. تعرّفي على أعراضه الحقيقية، ومتى يكون نسب العَرَض للأسنان تأخيرًا لتشخيص آخر.",
  body: [
    p(
      "التسنين مرحلة طبيعية في تطور الطفل، لكنها من المراحل التي ترتبط بالكثير من المعتقدات الشائعة. ارتفاع الحرارة، الإسهال، اضطراب النوم، البكاء وحتى الزكام كثيرًا ما تُنسب للتسنين، رغم أن ظهورها في نفس الفترة لا يعني بالضرورة أن الأسنان هي السبب."
    ),

    h2("متى يبدأ التسنين؟"),
    p(
      "يظهر السن الأول لدى معظم الأطفال خلال السنة الأولى، وغالبًا حول عمر ",
      ["6 أشهر", "strong"],
      "، لكن هناك تفاوت طبيعي كبير بين الأطفال؛ فقد يظهر قبل عمر 4 أشهر لدى بعضهم، أو بعد عمر السنة لدى آخرين."
    ),
    p(
      "عادةً تكون القواطع الأمامية من أول الأسنان ظهورًا، ويستمر ظهور الأسنان اللبنية تدريجيًا حتى عمر سنتين إلى ثلاث سنوات تقريبًا."
    ),
    p("لذلك، تأخّر ظهور السن الأول مقارنة بطفل آخر لا يعني بحدّ ذاته وجود مشكلة."),

    h2("ما هي الأعراض التي قد ترافق التسنين؟"),
    p("قد يمرّ التسنين دون أي أعراض واضحة، وعندما تظهر أعراض فهي غالبًا خفيفة ومؤقتة."),
    p("من الأعراض التي قد نلاحظها:"),

    h3("زيادة إفراز اللعاب"),
    p("قد يصبح سيلان اللعاب أكثر وضوحًا خلال هذه الفترة."),

    h3("الرغبة في العضّ والمضغ"),
    p(
      "يبحث الطفل عن أشياء يضعها في فمه ويضغط عليها باللثة، وقد يساعد هذا الضغط في تخفيف الانزعاج."
    ),

    h3("حساسية أو تورّم بسيط في اللثة"),
    p("قد تبدو المنطقة التي سيظهر منها السن أكثر احمرارًا أو حساسية."),

    h3("انزعاج أو عصبية بسيطة"),
    p("قد يصبح الطفل أكثر تململًا من المعتاد لفترة قصيرة حول ظهور السن."),

    h3("تهيّج الجلد حول الفم"),
    p(
      "زيادة اللعاب وملامسته المستمرة للجلد قد تؤدي إلى احمرار أو طفح بسيط حول الفم والذقن."
    ),

    h2("ماذا عن الحرارة؟"),
    p("من أكثر المعتقدات انتشارًا أن التسنين يسبّب الحمّى."),
    p(
      "قد تتزامن فترة ظهور الأسنان مع ",
      ["ارتفاع طفيف في درجة حرارة الجسم ضمن المجال الطبيعي", "strong"],
      "، لكن الأدلة لا تدعم اعتبار التسنين سببًا لحمّى حقيقية."
    ),
    p(
      "لذلك، إذا وصلت حرارة الطفل إلى ",
      ["38°C أو أكثر", "strong"],
      "، فلا يُفضَّل تفسيرها تلقائيًا بأنها «من الأسنان»، خصوصًا إذا رافقتها أعراض أخرى أو بدا الطفل مريضًا."
    ),
    p(
      "وهذه نقطة مهمة؛ لأن نسبة الحمّى للتسنين قد تؤدي إلى تأخّر اكتشاف سبب آخر، مثل عدوى فيروسية أو بكتيرية."
    ),

    h2("هل التسنين يسبّب الإسهال؟"),
    p("لا توجد أدلة جيدة تثبت أن التسنين يسبّب الإسهال."),
    p(
      "قد يتزامن الإسهال مع فترة التسنين، لكن التزامن لا يعني أن أحدهما سبّب الآخر. لذلك، الإسهال المتكرّر أو المستمر — خصوصًا إذا ترافق مع قيء، حرارة، انخفاض في كمية البول أو علامات جفاف — يحتاج إلى تقييم بحسب حالة الطفل وعمره."
    ),
    p(
      "كذلك لا يُعتبر ",
      ["سيلان الأنف، المرض المتكرّر أو البكاء الشديد", "strong"],
      " من الأعراض التي ينبغي تفسيرها تلقائيًا بالتسنين."
    ),

    h2("كيف نخفّف انزعاج التسنين؟"),
    p("في معظم الحالات لا يحتاج الطفل إلى علاج، ويمكن استخدام وسائل بسيطة وآمنة:"),
    li("تدليك اللثة بلطف بإصبع نظيف."),
    li("إعطاء الطفل عضّاضة مناسبة لعمره."),
    li(
      "يمكن تبريد العضّاضة في ",
      ["الثلاجة", "strong"],
      "، لكن لا يُنصح بتجميدها حتى تصبح شديدة الصلابة."
    ),
    li("إذا كان الطفل يعاني من ألم واضح، يمكن استشارة الطبيب حول الحاجة إلى مسكّن مناسب لعمره ووزنه."),
    p(
      "لا يُنصح باستخدام ",
      ["جل التسنين المحتوي على benzocaine", "strong"],
      " للأطفال، كما لا توصي الأكاديمية الأمريكية لطب الأطفال بقلادات الكهرمان أو قلادات التسنين؛ إذ لا توجد أدلة تثبت فعاليتها، بينما قد تشكّل خطر الاختناق أو الخنق."
    ),

    h2("متى لا نقول «أكيد من الأسنان»؟"),
    p(
      "إذا كان الطفل يعاني من ",
      [
        "حمّى حقيقية، إسهال مستمر، قيء، خمول واضح، بكاء شديد أو غير معتاد، صعوبة في التنفس، انخفاض في الرضاعة أو الشرب، أو بدا مريضًا بشكل عام",
        "strong",
      ],
      "، فمن المهم عدم افتراض أن السبب هو التسنين، وتقييم الحالة وفق عمر الطفل والأعراض المصاحبة."
    ),

    h2("الخلاصة"),
    p(
      "التسنين مرحلة طبيعية، وغالبًا تكون أعراضها محدودة: ",
      ["زيادة اللعاب، الرغبة بالمضغ، حساسية اللثة وانزعاج بسيط", "strong"],
      "."
    ),
    p(
      "أما الحمّى الحقيقية والإسهال والبكاء الشديد أو أعراض المرض الواضحة، فلا ينبغي اعتبارها جزءًا طبيعيًا من التسنين."
    ),
    quote(
      "وجود الأسنان في طريقها للظهور لا يعني أن كل ما يحدث للطفل في تلك الفترة سببه التسنين."
    ),
  ],
};

const HE: Content = {
  title: "בקיעת שיניים אצל תינוקות: מהם התסמינים האמיתיים?",
  excerpt:
    "חום, שלשול ובכי חזק מיוחסים לא פעם לבקיעת שיניים — והראיות אינן תומכות בכך. אילו תסמינים באמת שייכים לה, ומתי ייחוס תסמין לשיניים מעכב אבחנה אחרת.",
  body: [
    p(
      "בקיעת שיניים היא שלב טבעי בהתפתחות התינוק, אך היא מלווה באמונות רווחות רבות. חום, שלשול, הפרעות שינה, בכי ואפילו נזלת מיוחסים לא פעם לבקיעת שיניים, אף שהופעתם באותה תקופה אינה מעידה בהכרח שהשיניים הן הסיבה."
    ),

    h2("מתי מתחילה בקיעת השיניים?"),
    p(
      "אצל רוב התינוקות השן הראשונה בוקעת במהלך השנה הראשונה, לרוב סביב גיל ",
      ["6 חודשים", "strong"],
      ", אך יש שונות טבעית גדולה בין תינוקות: אצל חלקם היא בוקעת לפני גיל 4 חודשים, ואצל אחרים אחרי גיל שנה."
    ),
    p(
      "בדרך כלל החותכות הקדמיות הן הראשונות לבקוע, ובקיעת שיני החלב נמשכת בהדרגה עד גיל שנתיים עד שלוש בקירוב."
    ),
    p("לכן איחור בבקיעת השן הראשונה בהשוואה לתינוק אחר אינו מעיד כשלעצמו על בעיה."),

    h2("אילו תסמינים עשויים ללוות את בקיעת השיניים?"),
    p("בקיעת שיניים עשויה לעבור ללא תסמינים בולטים, וכשהם מופיעים הם לרוב קלים וזמניים."),
    p("בין התסמינים שאפשר להבחין בהם:"),

    h3("ריור מוגבר"),
    p("הריור עשוי להיות בולט יותר בתקופה הזו."),

    h3("רצון לנשוך וללעוס"),
    p(
      "התינוק מחפש חפצים להכניס לפה וללחוץ עליהם בחניכיים, והלחץ הזה עשוי להקל על אי-הנוחות."
    ),

    h3("רגישות או נפיחות קלה בחניכיים"),
    p("האזור שממנו עתידה לבקוע השן עשוי להיראות אדום או רגיש יותר."),

    h3("אי-נוחות או עצבנות קלה"),
    p("התינוק עשוי להיות חסר מנוחה מהרגיל לפרק זמן קצר סביב בקיעת השן."),

    h3("גירוי בעור סביב הפה"),
    p(
      "ריור מוגבר ומגע מתמשך שלו בעור עלולים לגרום לאדמומיות או לפריחה קלה סביב הפה והסנטר."
    ),

    h2("ומה לגבי חום?"),
    p("מהאמונות הרווחות ביותר היא שבקיעת שיניים גורמת לחום."),
    p(
      "תקופת בקיעת השיניים עשויה להתלוות ל",
      ["עלייה קלה בטמפרטורת הגוף בתוך הטווח התקין", "strong"],
      ", אך הראיות אינן תומכות בכך שבקיעת שיניים גורמת לחום ממשי."
    ),
    p(
      "לכן, אם חום התינוק מגיע ל",
      ["38°C ומעלה", "strong"],
      ", מוטב שלא לפרש אותו אוטומטית כ«בגלל השיניים», במיוחד אם מתלווים אליו תסמינים נוספים או שהתינוק נראה חולה."
    ),
    p(
      "זו נקודה חשובה: ייחוס החום לבקיעת שיניים עלול לעכב גילוי של סיבה אחרת, כמו זיהום ויראלי או חיידקי."
    ),

    h2("האם בקיעת שיניים גורמת לשלשול?"),
    p("אין ראיות טובות לכך שבקיעת שיניים גורמת לשלשול."),
    p(
      "שלשול עשוי להופיע במקביל לתקופת בקיעת השיניים, אך הופעה בו-זמנית אינה מעידה שאחד גרם לשני. לכן שלשול חוזר או מתמשך — במיוחד בליווי הקאות, חום, ירידה בכמות השתן או סימני התייבשות — מצריך הערכה בהתאם למצב התינוק ולגילו."
    ),
    p(
      "גם ",
      ["נזלת, תחלואה חוזרת או בכי חזק", "strong"],
      " אינם תסמינים שיש לפרש אוטומטית כבקיעת שיניים."
    ),

    h2("כיצד מקלים על אי-הנוחות?"),
    p("ברוב המקרים התינוק אינו זקוק לטיפול, ואפשר להיעזר באמצעים פשוטים ובטוחים:"),
    li("עיסוי עדין של החניכיים באצבע נקייה."),
    li("מתן נשכן המתאים לגיל התינוק."),
    li(
      "אפשר לקרר את הנשכן ב",
      ["מקרר", "strong"],
      ", אך לא מומלץ להקפיא אותו עד שיהיה קשה מאוד."
    ),
    li("אם התינוק סובל מכאב ברור, אפשר להתייעץ עם הרופאה לגבי הצורך במשכך המתאים לגילו ולמשקלו."),
    p(
      "לא מומלץ להשתמש ב",
      ["ג'ל לבקיעת שיניים המכיל benzocaine", "strong"],
      " אצל תינוקות, וכן האקדמיה האמריקאית לרפואת ילדים אינה ממליצה על שרשראות ענבר או שרשראות לבקיעת שיניים: אין ראיות ליעילותן, ואילו סכנת החנק או החניקה קיימת."
    ),

    h2("מתי לא אומרים «זה בטח מהשיניים»?"),
    p(
      "אם התינוק סובל מ",
      [
        "חום ממשי, שלשול מתמשך, הקאות, רדימות בולטת, בכי חזק או חריג, קושי בנשימה, ירידה בהנקה או בשתייה, או שהוא נראה חולה באופן כללי",
        "strong",
      ],
      ", חשוב לא להניח שהסיבה היא בקיעת שיניים, ולהעריך את המצב לפי גיל התינוק והתסמינים הנלווים."
    ),

    h2("לסיכום"),
    p(
      "בקיעת שיניים היא שלב טבעי, ותסמיניה לרוב מוגבלים: ",
      ["ריור מוגבר, רצון ללעוס, רגישות בחניכיים ואי-נוחות קלה", "strong"],
      "."
    ),
    p(
      "ואילו חום ממשי, שלשול, בכי חזק או תסמיני מחלה ברורים אינם חלק טבעי מבקיעת שיניים."
    ),
    quote(
      "העובדה ששן בדרכה לבקוע אינה אומרת שכל מה שקורה לתינוק באותה תקופה נובע ממנה."
    ),
  ],
};

const EN: Content = {
  title: "Teething: what the real symptoms are",
  excerpt:
    "Fever, diarrhoea and hard crying are often blamed on teething — and the evidence does not support it. Here is what teething actually causes, and when blaming the teeth delays another diagnosis.",
  body: [
    p(
      "Teething is a normal stage in a child's development, but it is one of the stages surrounded by the most folklore. Fever, diarrhoea, disturbed sleep, crying, even a runny nose are frequently blamed on teething — yet appearing in the same period does not mean the teeth are the cause."
    ),

    h2("When does teething start?"),
    p(
      "For most babies the first tooth appears during the first year, usually around ",
      ["6 months", "strong"],
      ", but the natural variation between babies is wide: for some it comes before 4 months, for others after the first birthday."
    ),
    p(
      "The front incisors are usually the first to appear, and the baby teeth continue coming through gradually until roughly two to three years of age."
    ),
    p("So a first tooth arriving later than another baby's does not, in itself, indicate a problem."),

    h2("What symptoms may come with teething?"),
    p("Teething can pass with no clear symptoms at all, and when symptoms do appear they are usually mild and short-lived."),
    p("Among the things you may notice:"),

    h3("More drooling"),
    p("Drooling may become more noticeable during this period."),

    h3("Wanting to bite and chew"),
    p(
      "The baby looks for things to put in their mouth and press against the gums; that pressure may ease the discomfort."
    ),

    h3("Tender or slightly swollen gums"),
    p("The area where the tooth is coming through may look redder or more sensitive."),

    h3("Mild fussiness or irritability"),
    p("The baby may be more restless than usual for a short while around the tooth's arrival."),

    h3("Skin irritation around the mouth"),
    p(
      "Extra saliva in constant contact with the skin can cause redness or a mild rash around the mouth and chin."
    ),

    h2("What about fever?"),
    p("One of the most widespread beliefs is that teething causes fever."),
    p(
      "Teething may coincide with ",
      ["a slight rise in body temperature within the normal range", "strong"],
      ", but the evidence does not support treating teething as a cause of genuine fever."
    ),
    p(
      "So if a baby's temperature reaches ",
      ["38°C or higher", "strong"],
      ", it is better not to explain it away as \"just the teeth\" — especially alongside other symptoms, or when the baby seems unwell."
    ),
    p(
      "This matters: attributing a fever to teething can delay finding another cause, such as a viral or bacterial infection."
    ),

    h2("Does teething cause diarrhoea?"),
    p("There is no good evidence that teething causes diarrhoea."),
    p(
      "Diarrhoea may coincide with teething, but coinciding does not mean one caused the other. Repeated or persistent diarrhoea — especially with vomiting, fever, reduced urine output or signs of dehydration — needs assessment based on the baby's age and condition."
    ),
    p(
      "Likewise, ",
      ["a runny nose, frequent illness or hard crying", "strong"],
      " should not be read automatically as teething."
    ),

    h2("How to ease teething discomfort"),
    p("In most cases no treatment is needed, and simple, safe measures are enough:"),
    li("Gently massage the gums with a clean finger."),
    li("Offer a teether suited to the baby's age."),
    li(
      "A teether can be cooled in the ",
      ["fridge", "strong"],
      ", but freezing it until it is rock hard is not advised."
    ),
    li("If the baby is in clear pain, ask your doctor whether a pain reliever suited to their age and weight is needed."),
    p(
      ["Teething gels containing benzocaine", "strong"],
      " are not recommended for babies, and the American Academy of Pediatrics does not recommend amber necklaces or teething necklaces: there is no evidence they work, while they carry a risk of choking or strangulation."
    ),

    h2("When not to say \"it must be the teeth\""),
    p(
      "If the baby has ",
      [
        "a genuine fever, persistent diarrhoea, vomiting, marked lethargy, severe or unusual crying, difficulty breathing, reduced feeding or drinking, or simply seems unwell",
        "strong",
      ],
      ", it is important not to assume teething is the cause, and to assess the situation by the baby's age and accompanying symptoms."
    ),

    h2("In short"),
    p(
      "Teething is a normal stage, and its symptoms are usually limited: ",
      ["more drooling, wanting to chew, tender gums and mild discomfort", "strong"],
      "."
    ),
    p(
      "Genuine fever, diarrhoea, hard crying or clear signs of illness should not be counted as a normal part of teething."
    ),
    quote(
      "A tooth on its way through does not mean that everything happening to your baby in that period comes from it."
    ),
  ],
};

/** المصادر لا تُترجَم — أسماء المؤسسات والدوريات تبقى بلغتها */
const SOURCES = [
  "American Academy of Pediatrics (AAP). Teething Pain Relief: How to Soothe Your Baby's Discomfort. HealthyChildren.org. Updated July 2025.",
  "American Academy of Pediatrics (AAP). Baby's First Tooth: 7 Facts Parents Should Know. HealthyChildren.org.",
  "American Academy of Pediatrics (AAP). When Does Teething Start? HealthyChildren.org.",
  "NHS. Baby teething symptoms. Reviewed May 2026.",
];

export const teething: ArticleSeed = {
  id: "article-teething",
  slug: "teething-real-symptoms",
  category: "development",
  sources: SOURCES,
  content: { ar: AR, he: HE, en: EN },
};
