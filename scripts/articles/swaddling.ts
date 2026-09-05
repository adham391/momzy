import { p, h2, h3, li, quote, type ArticleSeed, type Content } from "./builders";

/**
 * تقميط الطفل — نوم آمن.
 *
 * ⚠️ العبرية والإنجليزية ترجمة آلية لمحتوى صحّي — تحتاج مراجعة بشرية قبل
 * الاعتماد. المصطلح العبري للتقميط «עטיפה» لا «חיתול» (وهي الحفاض).
 */
const AR: Content = {
  title: "تقميط الطفل: متى يكون مفيدًا وكيف نستخدمه بأمان؟",
  excerpt:
    "التقميط وسيلة اختيارية قد تهدّئ بعض الأطفال في أسابيعهم الأولى — لكنّه لا يحمي من موت الرضيع المفاجئ، وله قواعد أمان لا تُتجاوَز، ووقت يجب التوقّف عنده.",
  body: [
    p(
      "التقميط (Swaddling)، أو ما يُعرف عند كثير من الأهل بـ«تدميج الطفل»، هو لفّ جسم الطفل الرضيع بقطعة قماش خفيفة بطريقة تمنحه الاحتواء وتحدّ من الحركات المفاجئة للأطراف. يُستخدم التقميط بشكل شائع خلال الفترة الأولى بعد الولادة كإحدى وسائل تهدئة الطفل ومساعدته على النوم."
    ),
    p(
      "لكن التقميط ليس ضرورة لكل طفل، ولا يُعتبر وسيلة للوقاية من ",
      ["متلازمة موت الرضيع المفاجئ (SIDS)", "strong"],
      ". وإذا اختار الأهل استخدامه، فمن المهم تطبيقه بطريقة آمنة ومعرفة متى يجب التوقف عنه."
    ),

    h2("لماذا قد يساعد التقميط الطفل؟"),
    p(
      "خلال الأشهر الأولى، يكون ",
      ["منعكس مورو (Moro reflex)", "strong"],
      " أو منعكس الفزع واضحًا لدى الطفل. قد يؤدي هذا المنعكس إلى حركة مفاجئة في الذراعين والساقين، وأحيانًا إلى إيقاظ الطفل أثناء نومه."
    ),
    p(
      "تقليل حركة الذراعين بواسطة التقميط قد يساعد بعض الأطفال على الشعور بالاحتواء والهدوء. وتشير مراجعة منهجية للأبحاث إلى أن التقميط قد يرتبط بزيادة مدة النوم الهادئ وتقليل الانتقال بين حالات النوم لدى بعض الأطفال."
    ),
    p("لكن استجابة الأطفال تختلف؛ فبعضهم يرتاح عند التقميط، بينما لا يحتاجه أو لا يتقبّله آخرون."),

    h2("كيف يكون التقميط آمنًا؟"),
    p("إذا تم استخدام التقميط، فهناك مجموعة من القواعد الأساسية:"),

    h3("النوم دائمًا على الظهر"),
    p(
      "يجب وضع الطفل المُقمّط على ظهره في كل مرة ينام فيها، سواء ليلًا أو خلال القيلولة. لا يوضع الطفل المُقمّط للنوم على البطن أو الجانب، لأن قدرته على استخدام ذراعيه لتغيير وضعيته تكون محدودة."
    ),

    h3("عدم شدّ منطقة الصدر بشكل مبالغ فيه"),
    p(
      "يجب أن يكون التقميط ثابتًا دون أن يضغط على صدر الطفل أو يعيق التنفس. توصي الأكاديمية الأمريكية لطب الأطفال بإمكانية إدخال ",
      ["إصبعين إلى ثلاثة أصابع", "strong"],
      " تقريبًا بين صدر الطفل والقماش."
    ),

    h3("ترك مساحة كافية لحركة الوركين والساقين"),
    p(
      "لا يجب لف الساقين بشكل مستقيم ومشدود إلى الأسفل. يحتاج الطفل إلى مساحة تسمح بثني الوركين والركبتين وتحريك الساقين بحرية. التقميط الضيق الذي يثبّت الساقين بوضعية مستقيمة قد يزيد خطر حدوث مشاكل في تطور مفصل الورك."
    ),

    h3("تجنّب ارتفاع حرارة الطفل"),
    p(
      "التقميط يضيف طبقة إضافية حول الجسم، لذلك يجب الانتباه إلى الملابس ودرجة حرارة البيئة وعدم المبالغة في تغطية الطفل. التعرّق، الشعر الرطب، احمرار الجلد أو التنفس السريع قد تكون علامات على ارتفاع حرارته."
    ),

    h3("عدم استخدام التقميط المُثقّل"),
    p("لا يُنصح باستخدام البطانيات أو أكياس التقميط التي تحتوي على أوزان أو ضغط إضافي على صدر الطفل."),

    h2("متى يجب التوقف عن التقميط؟"),
    p("لا نعتمد فقط على عمر محدّد."),
    p(
      "يجب التوقف عن التقميط ",
      ["بمجرد أن يبدأ الطفل بإظهار علامات تدل على محاولته التقلّب", "strong"],
      ". قد يبدأ ذلك لدى بعض الأطفال في عمر مبكر يصل إلى شهرين، بينما يحدث لاحقًا لدى أطفال آخرين."
    ),
    p(
      "تكمن الخطورة في أن الطفل إذا انتقل إلى بطنه وهو مُقمّط، فقد لا يستطيع استخدام ذراعيه بالشكل اللازم لتغيير وضعيته، ما يزيد خطر الاختناق والوفيات المرتبطة بالنوم."
    ),
    p(
      "بعد إيقاف التقميط يمكن استخدام ",
      ["كيس نوم عادي مناسب للطفل يسمح بحرية حركة الذراعين والجسم", "strong"],
      " بدلًا منه."
    ),

    h2("هل يجب أن تكون يدا الطفل داخل التقميط؟"),
    p(
      "لا توجد أدلة تشير إلى أن إبقاء الذراعين داخل التقميط أو خارجه يغيّر بحدّ ذاته خطر SIDS. الأهم هو تطبيق قواعد النوم الآمن والتوقف عن أي نوع من التقميط يقيّد الذراعين أو الصدر عندما يبدأ الطفل بمحاولة التقلّب."
    ),

    h2("الخلاصة"),
    p(
      "التقميط وسيلة اختيارية يمكن أن تساعد بعض الأطفال خلال الفترة الأولى على الهدوء والنوم، لكنه ليس ضروريًا لنوم الطفل ولا يحمي من SIDS."
    ),
    p("إذا اخترتم تقميط طفلكم، تذكّروا القواعد الخمس:"),
    li("نوم على الظهر في كل مرة."),
    li("تقميط غير مشدود على الصدر — إصبعان إلى ثلاثة."),
    li("مساحة حرّة للوركين والساقين."),
    li("تجنّب ارتفاع الحرارة."),
    li("التوقف فور ظهور أولى محاولات التقلّب."),
    quote("التقميط اختيار لا واجب. إن هدّأ طفلكِ فاستعمليه بقواعده، وإن لم يتقبّله فلا شيء ينقصه."),
  ],
};

const HE: Content = {
  title: "עטיפת התינוק (Swaddling): מתי היא מועילה וכיצד לעשות זאת בבטחה?",
  excerpt:
    "עטיפת התינוק היא אמצעי אופציונלי שעשוי להרגיע חלק מהתינוקות בשבועות הראשונים — אך היא אינה מגנה מפני מוות בעריסה, יש לה כללי בטיחות שאין לחרוג מהם, ויש רגע שבו צריך להפסיק.",
  body: [
    p(
      "עטיפת התינוק (Swaddling) היא ליפוף גוף התינוק בבד דק באופן שמעניק לו תחושת הכלה ומגביל תנועות פתאומיות של הגפיים. העטיפה נפוצה בתקופה הראשונה שאחרי הלידה כאחת הדרכים להרגיע את התינוק ולסייע לו לישון."
    ),
    p(
      "אך העטיפה אינה הכרחית לכל תינוק, והיא אינה אמצעי למניעת ",
      ["תסמונת מוות פתאומי בעריסה (SIDS)", "strong"],
      ". אם ההורים בוחרים להשתמש בה, חשוב ליישם אותה בבטחה ולדעת מתי להפסיק."
    ),

    h2("למה העטיפה עשויה לעזור לתינוק?"),
    p(
      "בחודשים הראשונים בולט אצל התינוק ",
      ["רפלקס מורו (Moro reflex)", "strong"],
      " או רפלקס הבהלה. הרפלקס עלול לגרום לתנועה פתאומית של הזרועות והרגליים, ולעיתים להעיר את התינוק משנתו."
    ),
    p(
      "הפחתת תנועת הזרועות באמצעות העטיפה עשויה לעזור לחלק מהתינוקות לחוש מוכלים ורגועים. סקירה שיטתית של המחקרים מצביעה על כך שהעטיפה עשויה להיות קשורה בהארכת משך השינה השקטה ובהפחתת המעברים בין מצבי שינה אצל חלק מהתינוקות."
    ),
    p("אבל התגובה משתנה מתינוק לתינוק: יש שנרגעים בעטיפה, ויש שאינם זקוקים לה או אינם מקבלים אותה."),

    h2("כיצד עוטפים בבטחה?"),
    p("אם בוחרים לעטוף, יש כמה כללי יסוד:"),

    h3("שינה תמיד על הגב"),
    p(
      "יש להשכיב את התינוק העטוף על גבו בכל שינה, בלילה ובשעות היום כאחד. אין להשכיב תינוק עטוף על הבטן או על הצד, משום שיכולתו להיעזר בזרועותיו כדי לשנות תנוחה מוגבלת."
    ),

    h3("לא להדק את אזור החזה"),
    p(
      "העטיפה צריכה להיות יציבה בלי ללחוץ על חזה התינוק או להפריע לנשימתו. האקדמיה האמריקאית לרפואת ילדים ממליצה שניתן יהיה להחדיר ",
      ["שתיים עד שלוש אצבעות", "strong"],
      " בערך בין חזה התינוק לבד."
    ),

    h3("להשאיר מרווח לתנועת הירכיים והרגליים"),
    p(
      "אין ללפף את הרגליים ישרות ומהודקות כלפי מטה. התינוק זקוק למרווח שיאפשר כיפוף של הירכיים והברכיים ותנועה חופשית של הרגליים. עטיפה הדוקה שמקבעת את הרגליים בתנוחה ישרה עלולה להגביר את הסיכון לבעיות בהתפתחות מפרק הירך."
    ),

    h3("להימנע מחימום יתר"),
    p(
      "העטיפה מוסיפה שכבה נוספת סביב הגוף, ולכן יש לשים לב ללבוש ולטמפרטורת החדר ולא להגזים בכיסוי. הזעה, שיער רטוב, אדמומיות בעור או נשימה מהירה עשויות להעיד על חימום יתר."
    ),

    h3("לא להשתמש בעטיפה משוקללת"),
    p("לא מומלץ להשתמש בשמיכות או בשקי עטיפה הכוללים משקולות או לחץ נוסף על חזה התינוק."),

    h2("מתי להפסיק את העטיפה?"),
    p("לא מסתמכים על גיל מסוים בלבד."),
    p(
      "יש להפסיק את העטיפה ",
      ["ברגע שהתינוק מתחיל להראות סימנים של ניסיון להתהפך", "strong"],
      ". אצל חלק מהתינוקות זה קורה כבר בגיל חודשיים, ואצל אחרים מאוחר יותר."
    ),
    p(
      "הסכנה היא שאם התינוק יתהפך על בטנו כשהוא עטוף, ייתכן שלא יוכל להיעזר בזרועותיו כנדרש כדי לשנות תנוחה — מה שמגביר את הסיכון לחנק ולמקרי מוות הקשורים בשינה."
    ),
    p(
      "לאחר הפסקת העטיפה אפשר להשתמש במקומה ב",
      ["שק שינה רגיל המתאים לתינוק ומאפשר תנועה חופשית של הזרועות והגוף", "strong"],
      "."
    ),

    h2("האם ידי התינוק צריכות להיות בתוך העטיפה?"),
    p(
      "אין ראיות לכך שהשארת הזרועות בתוך העטיפה או מחוצה לה משנה כשלעצמה את הסיכון ל-SIDS. החשוב הוא יישום כללי השינה הבטוחה והפסקת כל עטיפה שמגבילה את הזרועות או את החזה ברגע שהתינוק מתחיל לנסות להתהפך."
    ),

    h2("לסיכום"),
    p(
      "העטיפה היא אמצעי אופציונלי שעשוי לעזור לחלק מהתינוקות להירגע ולישון בתקופה הראשונה, אך אינה הכרחית לשנת התינוק ואינה מגנה מפני SIDS."
    ),
    p("אם בחרתם לעטוף את תינוקכם, זכרו את חמשת הכללים:"),
    li("שינה על הגב בכל פעם."),
    li("עטיפה לא הדוקה על החזה — שתיים עד שלוש אצבעות."),
    li("מרווח חופשי לירכיים ולרגליים."),
    li("הימנעות מחימום יתר."),
    li("הפסקה מיד עם ניסיונות ההתהפכות הראשונים."),
    quote(
      "העטיפה היא בחירה, לא חובה. אם היא מרגיעה את תינוקך — השתמשי בה לפי הכללים; ואם אינו מקבל אותה — לא חסר לו דבר."
    ),
  ],
};

const EN: Content = {
  title: "Swaddling: when it helps, and how to use it safely",
  excerpt:
    "Swaddling is optional. It may settle some babies through their first weeks — but it does not protect against SIDS, it has safety rules that cannot be bent, and there is a moment to stop.",
  body: [
    p(
      "Swaddling is wrapping a baby's body in a light cloth in a way that gives a sense of containment and limits sudden movements of the arms and legs. It is commonly used in the first period after birth as one way to settle a baby and help them sleep."
    ),
    p(
      "But swaddling is not necessary for every baby, and it is not a way to prevent ",
      ["sudden infant death syndrome (SIDS)", "strong"],
      ". If parents choose to use it, it matters that they do so safely — and that they know when to stop."
    ),

    h2("Why swaddling may help a baby"),
    p(
      "During the first months the ",
      ["Moro reflex", "strong"],
      ", or startle reflex, is pronounced. It can cause a sudden movement of the arms and legs, and sometimes wakes the baby from sleep."
    ),
    p(
      "Reducing arm movement through swaddling may help some babies feel contained and calm. A systematic review of the research suggests swaddling may be associated with longer quiet sleep and fewer transitions between sleep states in some babies."
    ),
    p(
      "Babies differ, though: some settle when swaddled, while others do not need it or will not accept it."
    ),

    h2("How to swaddle safely"),
    p("If you do swaddle, a few rules are essential:"),

    h3("Always on the back"),
    p(
      "A swaddled baby must be placed on their back for every sleep, at night and for naps alike. A swaddled baby is never put down on their stomach or side, because their ability to use their arms to change position is limited."
    ),

    h3("Never tight across the chest"),
    p(
      "The swaddle should be secure without pressing on the baby's chest or restricting breathing. The American Academy of Pediatrics recommends being able to fit roughly ",
      ["two to three fingers", "strong"],
      " between the baby's chest and the cloth."
    ),

    h3("Leave room for the hips and legs"),
    p(
      "The legs should not be wrapped straight and pulled tight. A baby needs room to bend at the hips and knees and to move the legs freely. A tight swaddle that fixes the legs straight may raise the risk of hip development problems."
    ),

    h3("Avoid overheating"),
    p(
      "A swaddle adds a layer around the body, so watch clothing and room temperature and do not over-cover the baby. Sweating, damp hair, flushed skin or rapid breathing can all signal overheating."
    ),

    h3("No weighted swaddles"),
    p(
      "Blankets or swaddle sacks that add weight or extra pressure on the baby's chest are not recommended."
    ),

    h2("When to stop swaddling"),
    p("Age alone is not the signal."),
    p(
      "Stop swaddling ",
      ["as soon as the baby shows any sign of trying to roll over", "strong"],
      ". For some babies this begins as early as two months; for others it comes later."
    ),
    p(
      "The danger is that a swaddled baby who ends up on their stomach may not be able to use their arms to change position — which raises the risk of suffocation and sleep-related death."
    ),
    p(
      "Once swaddling stops, an ",
      ["ordinary sleep sack sized for the baby, allowing the arms and body to move freely", "strong"],
      ", can be used instead."
    ),

    h2("Should the baby's hands be inside the swaddle?"),
    p(
      "There is no evidence that keeping the arms inside or outside the swaddle changes SIDS risk in itself. What matters is following safe-sleep rules and stopping any swaddle that restricts the arms or chest once the baby starts trying to roll."
    ),

    h2("In short"),
    p(
      "Swaddling is an optional tool that can help some babies settle and sleep in the first period. It is not required for a baby to sleep, and it does not protect against SIDS."
    ),
    p("If you choose to swaddle, remember the five rules:"),
    li("On the back, every time."),
    li("Not tight across the chest — two to three fingers."),
    li("Free room for the hips and legs."),
    li("Avoid overheating."),
    li("Stop at the very first attempt to roll."),
    quote(
      "Swaddling is a choice, not a duty. If it settles your baby, use it by the rules; if they will not take it, they are missing nothing."
    ),
  ],
};

/** المصادر لا تُترجَم — أسماء المؤسسات والدوريات تبقى بلغتها */
const SOURCES = [
  "American Academy of Pediatrics (AAP). Swaddling: Is it Safe for Your Baby? HealthyChildren.org.",
  "American Academy of Pediatrics (AAP). How to Keep Your Sleeping Baby Safe: AAP Policy Explained. HealthyChildren.org.",
  "Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD). Safe to Sleep® — Frequently Asked Questions.",
  "McDonnell E, Moon RY. Infant deaths and injuries associated with wearable blankets, swaddle wraps, and swaddling. Journal of Pediatrics.",
  "The effect of swaddling on infant sleep and arousal: A systematic review and narrative synthesis. Frontiers in Pediatrics. 2022.",
];

export const swaddling: ArticleSeed = {
  id: "article-swaddling",
  slug: "swaddling-safe-use",
  category: "sleep",
  sources: SOURCES,
  content: { ar: AR, he: HE, en: EN },
};
