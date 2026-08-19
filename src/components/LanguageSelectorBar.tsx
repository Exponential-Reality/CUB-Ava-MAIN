import React, { useState } from "react";
import {
  Globe2,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
} from "lucide-react";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  samplePrompt: string;
}

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
    samplePrompt: "안녕하세요! 캐리비안 유니온 은행에서 예금 계좌를 개설하기 위한 이자율과 필요 서류는 무엇인가요?",
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
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    samplePrompt: "Dzień dobry! Jakie jest oprocentowanie i wymagane dokumenty do otwarcia konta w CUB?",
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪",
    samplePrompt: "Hej! Vilka räntor och dokument krävs för att öppna ett sparkonto hos Caribbean Union Bank?",
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    flag: "🇬🇷",
    samplePrompt: "Γεια σας! Ποια είναι τα επιτόκια και τα δικαιολογητικά για το άνοιγμα τραπεζικού λογαριασμού στην CUB;",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    samplePrompt: "Merhaba! Caribbean Union Bank'ta tasarruf hesabı açmak için faiz oranları ve gerekli belgeler nelerdir?",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    samplePrompt: "হ্যালো! ক্যারিবিয়ান ইউনিয়ন ব্যাংকে সেভিংস অ্যাকাউন্ট খোলার জন্য সুদের হার এবং প্রয়োজনীয় কাগজপত্র কী কী?",
  },
];

interface LanguageSelectorBarProps {
  onSelectLanguagePrompt?: (prompt: string) => void;
}

export const LanguageSelectorBar: React.FC<LanguageSelectorBarProps> = ({
  onSelectLanguagePrompt,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("en");

  const currentLang = LANGUAGES_LIST.find((l) => l.code === selectedCode) || LANGUAGES_LIST[0];

  const filteredLanguages = LANGUAGES_LIST.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lang: LanguageOption) => {
    setSelectedCode(lang.code);
    setIsOpen(false);
    if (onSelectLanguagePrompt) {
      onSelectLanguagePrompt(lang.samplePrompt);
    }
  };

  return (
    <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-md backdrop-blur-md">
      {/* Top Header Row with Expand Trigger */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--t-primary)]/15 text-[var(--t-primary)] border border-[var(--t-primary)]/30">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white font-['Sora']">
                Language Support (24+ Languages)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[var(--t-primary)] border border-white/10">
                {currentLang.flag} {currentLang.name}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-soft)]">
              Select your preferred language to interact with CUB AI in your native tongue.
            </p>
          </div>
        </div>

        {/* Expand / Collapse Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
            isOpen
              ? "bg-[var(--t-primary)] text-[#0a0806] border-[var(--t-primary)]"
              : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-[var(--t-primary)]/40"
          }`}
          title="Expand Language Selector"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>{isOpen ? "Close Languages" : "Change Language (24+)"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Language Dropdown Grid */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Choose from 24 Supported Languages:</span>
            </div>

            {/* Language Search */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--t-primary)]"
              />
            </div>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedCode === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-[var(--t-primary)]/20 border-[var(--t-primary)] text-white shadow-sm"
                      : "bg-black/50 hover:bg-white/[0.08] border-white/5 hover:border-[var(--t-primary)]/40 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-lg">{lang.flag}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--t-primary)]" />}
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xs font-bold truncate group-hover:text-[var(--t-primary)]">
                      {lang.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-soft)] truncate">
                      {lang.nativeName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
