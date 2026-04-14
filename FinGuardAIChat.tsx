// FinGuardAIChat.tsx
// مكون محادثة ذكي متكامل (FinGuard AI) – نسخة TypeScript + React
// تم الحفاظ على جميع عناصر الواجهة الأصلية دون تغيير

import React, { useState, useEffect, useRef } from 'react';

// تعريف نوع البيانات لكل رسالة في المحادثة
interface Message {
  id: string;           // معرف فريد
  text: string;         // نص الرسالة
  sender: 'user' | 'ai'; // المرسل: مستخدم أو الذكاء الاصطناعي
  time: string;         // وقت الإرسال (hh:mm)
}

// المكون الرئيسي لواجهة المحادثة
const ChatInterface: React.FC = () => {
  // دالة مساعدة لاستخراج الوقت الحالي بصيغة hh:mm
  const getFormattedTime = (): string => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // حالة تخزين قائمة الرسائل (تبدأ برسالة ترحيب من AI)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: 'مرحباً! أنا المساعد الذكي FinGuard AI. كيف يمكنني مساعدتك اليوم في التدقيق المالي أو الاستفسار عن السياسات؟',
      sender: 'ai',
      time: getFormattedTime(),
    },
  ]);

  const [input, setInput] = useState<string>('');        // النص المدخل من المستخدم
  const [isTyping, setIsTyping] = useState<boolean>(false); // حالة كتابة الـ AI
  const [isSending, setIsSending] = useState<boolean>(false); // حالة إرسال الرسالة

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // مرجع لآخر رسالة (للتمرير التلقائي)
  const fileInputRef = useRef<HTMLInputElement | null>(null); // مرجع لحقل إرفاق الملفات المخفي

  // التمرير إلى أسفل المحادثة عند إضافة رسائل جديدة أو عند بدء الكتابة
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isTyping) scrollToBottom();
  }, [isTyping]);

  // منطق محاكاة استجابة الذكاء الاصطناعي بناءً على نص المستخدم
  const getAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('سياسة') || lowerMsg.includes('قانون')) {
      return 'يمكنني الاطلاع على سياسات الشركة مثل سياسة المشتريات التقنية (حد 3000$)، وسياسة مكافحة غسيل الأموال، وسياسة السفر. هل تريد تفصيلاً لأي منها؟';
    } else if (lowerMsg.includes('طلب') || lowerMsg.includes('اعتماد')) {
      return 'لتحليل طلب مالي، يرجى استخدام صفحة "تحليل AI" المخصصة. يمكنك إدخال الغرض والمبلغ وسأقارنه بالسياسات المخزنة في قاعدة RAG.';
    } else if (lowerMsg.includes('شكر')) {
      return 'على الرحب والسعة! أنا هنا لمساعدتك في أي استفسار مالي.';
    } else {
      return 'شكراً لتواصلك. أنا FinGuard AI، متخصص في التدقيق المالي والامتثال. يمكنك سؤالي عن سياسة معينة، أو طلب تحليل طلب، أو الاستفسار عن نظام RAG.';
    }
  };

  // إرسال رسالة المستخدم ومعالجة الرد
  const handleSendMessage = async (): Promise<void> => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSending || isTyping) return;

    setIsSending(true);

    // إضافة رسالة المستخدم إلى القائمة
    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      sender: 'user',
      time: getFormattedTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput(''); // تفريغ حقل الإدخال
    setIsTyping(true); // إظهار مؤشر الكتابة

    // محاكاة زمن استجابة الشبكة (800-1500 مللي)
    const delay = 800 + Math.random() * 700;
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const aiReply: Message = {
        id: crypto.randomUUID(),
        text: getAIResponse(trimmedInput),
        sender: 'ai',
        time: getFormattedTime(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      // في حالة حدوث خطأ (محاكاة) نعرض رسالة خطأ
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        text: 'عذراً، حدث خلل في الاتصال. حاول مرة أخرى.',
        sender: 'ai',
        time: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  // إرسال الرسالة عند الضغط على Enter (دون Shift)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending && !isTyping) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // فتح نافذة اختيار الملفات
  const handleAttachFile = (): void => {
    fileInputRef.current?.click();
  };

  // معالج اختيار ملف (تنبيه توضيحي فقط – لم يتم تفعيل الرفع الحقيقي)
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`تم اختيار الملف: ${file.name}\n(هذه تجربة واجهة فقط، الرفع غير مفعل)`);
    }
    e.target.value = ''; // إعادة تعيين الحقل للسماح باختيار نفس الملف مجدداً
  };

  // دالة للتمرير إلى أعلى الصفحة (زر المنزل)
  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#070b14] to-[#0f1622]">
      {/* رأس الدردشة – يحتوي على أيقونة المنزل في الأعلى (يمين في RTL) */}
      <div className="glass-card mx-4 mt-4 rounded-2xl p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center">
            <i className="fas fa-robot text-emerald-300 text-xl"></i>
          </div>
          <div>
            <h2 className="text-white font-bold">FinGuard AI Chat</h2>
            <p className="text-xs text-emerald-300/70">متصل | مدقق مالي ذكي</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* زر المنزل (أعلى الصفحة) */}
          <button
            onClick={scrollToTop}
            className="text-gray-300 hover:text-emerald-400 transition p-2 rounded-full hover:bg-white/10"
            aria-label="المنزل / أعلى الصفحة"
          >
            <i className="fas fa-home text-xl"></i>
          </button>
          <button className="text-gray-400 hover:text-white transition p-2" aria-label="القائمة">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* منطقة عرض الرسائل مع تمرير عمودي */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] ${
                msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.sender === 'ai' ? (
                  <i className="fas fa-microchip text-emerald-400 text-xs"></i>
                ) : (
                  <i className="fas fa-user text-gray-300 text-xs"></i>
                )}
                <span className="text-xs opacity-70">
                  {msg.sender === 'ai' ? 'FinGuard AI' : 'أنت'}
                </span>
                <span className="text-[10px] opacity-50">{msg.time}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {/* مؤشر كتابة الـ AI (ثلاث نقاط متحركة) */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="ai-bubble flex items-center gap-2">
              <i className="fas fa-microchip text-emerald-400 text-xs"></i>
              <div className="typing-indicator flex gap-1">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-xs text-gray-400 mr-1">يكتب...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* شريط إدخال الرسائل + زر الإرفاق والإرسال */}
      <div className="p-4 glass-card mx-4 mb-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAttachFile}
            className="text-gray-400 hover:text-emerald-400 transition disabled:opacity-50"
            disabled={isSending || isTyping}
            aria-label="إرفاق ملف"
          >
            <i className="fas fa-paperclip text-lg"></i>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="اكتب سؤالك المالي هنا..."
            disabled={isSending || isTyping}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm disabled:opacity-60"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isSending || isTyping}
            className="send-btn text-white p-2 rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50"
            aria-label="إرسال"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </div>
        <div className="flex gap-3 mt-2 text-xs text-gray-400 px-1">
          <span>
            <i className="fas fa-database ml-1"></i> RAG نشط
          </span>
          <span>
            <i className="fas fa-shield-alt ml-1"></i> تدقيق فوري
          </span>
        </div>
        {/* حقل إرفاق الملفات المخفي */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onFileSelected}
          accept=".pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};

// المكون الرئيسي للتطبيق (يحتوي فقط على واجهة المحادثة)
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <ChatInterface />
    </div>
  );
};

export default App;