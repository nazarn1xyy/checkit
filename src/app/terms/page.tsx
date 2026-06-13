import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl min-h-screen">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6 text-brand">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Умови використання</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
        </p>
      </div>

      <div className="bg-surface border border-gray-800 rounded-[32px] p-8 md:p-12 shadow-2xl">
        <div className="prose prose-invert prose-brand max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80">
          <p className="lead text-xl text-gray-300 mb-8">
            Ласкаво просимо до CheckIt! Будь ласка, уважно прочитайте ці умови перед використанням нашого сервісу.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">1. Загальні положення</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Використовуючи платформу CheckIt ("Сервіс"), ви погоджуєтеся з цими Умовами використання. Сервіс надає інструменти на базі штучного інтелекту для аналізу та оцінки бізнес-ідей.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">2. Використання сервісу</h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-400 mb-6 marker:text-brand">
            <li>Ви погоджуєтеся використовувати сервіс тільки в законних цілях.</li>
            <li>Ви несете відповідальність за будь-які дані (опис ідеї, параметри), які вводите в систему.</li>
            <li>Автоматизований аналіз надається "як є" і служить як рекомендаційний матеріал, а не фінальна бізнес-експертиза.</li>
          </ul>

          <h2 className="text-2xl text-white mt-10 mb-4">3. Інтелектуальна власність</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Всі права на алгоритми, дизайн та програмний код платформи належать CheckIt. Ідеї та бізнес-дані, які ви перевіряєте через наш сервіс, залишаються вашою інтелектуальною власністю. Ми не претендуємо на права щодо ваших стартапів.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">4. Обмеження відповідальності</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            CheckIt використовує мовні моделі (AI) для генерації звітів. Ми не гарантуємо 100% точності ринкових прогнозів чи фінансових моделей. Користувач самостійно приймає бізнес-рішення на основі згенерованих звітів та несе за них відповідальність.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">5. Оплата та підписка</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Деякі функції доступні на платній основі (Premium-тарифи). Оплата здійснюється авансом за обраний період. Ви можете скасувати автоматичне поновлення підписки в будь-який момент у налаштуваннях профілю.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">6. Зміни до умов</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Ми можемо час від часу оновлювати ці Умови. Про суттєві зміни ми будемо повідомляти користувачів через електронну пошту або повідомлення на платформі.
          </p>
          
          <hr className="my-10 border-gray-800" />
          
          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-2">Залишилися питання?</h3>
            <p className="text-gray-400">
              Якщо у вас є запитання щодо цих умов, будь ласка, зв'яжіться з нами: <a href="mailto:hello@checkit.ai" className="text-brand font-medium">hello@checkit.ai</a>
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors">
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
