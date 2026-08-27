export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  samplePrompt: string;
}

/**
 * Languages natively supported by the Gemini AI Model and CUB Ava assistant
 */
export const LANGUAGES_LIST: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇦🇬",
    samplePrompt: "Hello! What are the interest rates for Caribbean Union Bank savings accounts?",
  },
  {
    code: "creole",
    name: "Antiguan Creole",
    nativeName: "Caribbean Dialect",
    flag: "🇦🇬",
    samplePrompt: "Wa gwan CUB! Me waan know wah documents me need fi open one savings account, and how much interest me a go get?",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    samplePrompt: "¡Hola! ¿Cuáles son las tasas de interés y los requisitos para abrir una cuenta en Caribbean Union Bank?",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    samplePrompt: "Bonjour! Quels sont les taux d'intérêt et les documents nécessaires pour ouvrir un compte à la CUB?",
  },
  {
    code: "ht",
    name: "Haitian Creole",
    nativeName: "Kreyòl Ayisyen",
    flag: "🇭🇹",
    samplePrompt: "Bonjou! Ki to enterè ak dokiman mwen bezwen pou m louvri yon kont epay nan CUB?",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
    samplePrompt: "Olá! Quais são as taxas de juros e os requisitos para abrir uma conta de poupança?",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    samplePrompt: "Guten Tag! Welche Zinssätze und Unterlagen werden für die Eröffnung eines Sparkontos benötigt?",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    samplePrompt: "Buongiorno! Quali sono i tassi di interesse e i documenti richiesti per aprire un conto?",
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    samplePrompt: "Hallo! Wat zijn de rentetarieven en vereisten om een spaarrekening te openen bij CUB?",
  },
  {
    code: "pap",
    name: "Papiamento",
    nativeName: "Papiamentu",
    flag: "🇨🇼",
    samplePrompt: "Bon dia! Kiko ta e interes i rekerimentunan pa habri un kuenta di spar na CUB?",
  },
  {
    code: "zh",
    name: "Mandarin Chinese",
    nativeName: "中文 (普通话)",
    flag: "🇨🇳",
    samplePrompt: "您好！在加勒比联合银行开设储蓄账户需要哪些文件和利率是多少？",
  },
  {
    code: "yue",
    name: "Cantonese",
    nativeName: "粵語",
    flag: "🇭🇰",
    samplePrompt: "你好！請問喺加勒比聯合銀行開立儲蓄戶口有咩要求同利息係點？",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    samplePrompt: "नमस्ते! कैरेबियन यूनियन बैंक में बचत खाता खोलने के लिए क्या दस्तावेज और ब्याज दरें हैं?",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    samplePrompt: "مرحباً! ما هي أسعار الفائدة والمستندات المطلوبة لفتح حساب توفير في بنك الاتحاد الكاريبي؟",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    samplePrompt: "こんにちは！カリビアン・ユニオン・バンクで普通預金口座を開設するための金利と必要書類を教えてください。",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    samplePrompt: "안녕하세요! 캐리比안 유니온 은행에서 예금 계좌를 개설하기 위한 이자율과 필요 서류는 무엇인가요?",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    samplePrompt: "Здравствуйте! Какие процентные ставки и документы требуются для открытия сберегательного счета в CUB?",
  },
  {
    code: "tl",
    name: "Tagalog / Filipino",
    nativeName: "Filipino",
    flag: "🇵🇭",
    samplePrompt: "Kumusta! Ano ang mga rate ng interes at kinakailangang dokumento para magbukas ng savings account?",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    samplePrompt: "Xin chào! Lãi suất và các giấy tờ cần thiết để mở tài khoản tiết kiệm tại CUB là gì?",
  },
  {
    code: "jam",
    name: "Jamaican Patois",
    nativeName: "Patwa",
    flag: "🇯🇲",
    samplePrompt: "Wah gwaan CUB! Mi waan know wah document dem mi need fi open one savings account and how di interest rate set?",
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    samplePrompt: "Dzień dobry! Jakie jest oprocentowanie i wymagane dokumenty do otwarcia konta w CUB?",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    samplePrompt: "Merhaba! Caribbean Union Bank'ta tasarruf hesabı açmak için faiz oranları ve gerekli belgeler nelerdir?",
  },
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "🇰🇪",
    samplePrompt: "Habari! Ni nyaraka gani zinazohitajika na viwango gani vya riba vya kufungua akaunti ya akiba katika CUB?",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    samplePrompt: "হ্যালো! ক্যারিবিয়ান ইউনিয়ন ব্যাংকে সেভিংস অ্যাকাউন্ট খোলার জন্য সুদের হার এবং প্রয়োজনীয় কাগজপত্র কী কী?",
  },
];
