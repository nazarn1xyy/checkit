import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl min-h-screen">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-full mb-6 text-brand">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Політика конфіденційності</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
        </p>
      </div>

      <div className="bg-surface border border-gray-800 rounded-[32px] p-8 md:p-12 shadow-2xl">
        <div className="prose prose-invert prose-brand max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand hover:prose-a:text-brand/80">
          <p className="lead text-xl text-gray-300 mb-8">
            Ваша конфіденційність є надзвичайно важливою для нас. Ця політика пояснює, як CheckIt збирає, використовує та захищає ваші дані.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">1. Які дані ми збираємо</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Ми можемо збирати наступні типи інформації:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-400 mb-6 marker:text-brand">
            <li><strong>Облікові дані:</strong> ім'я, адреса електронної пошти та інформація про профіль при реєстрації.</li>
            <li><strong>Дані бізнес-ідей:</strong> описи ідей, параметри аудиторії та інші вхідні дані, які ви надаєте для аналізу.</li>
            <li><strong>Дані про використання:</strong> інформація про вашу взаємодію з платформою, згенеровані звіти та історія аналізів.</li>
            <li><strong>Технічні дані:</strong> IP-адреса, тип браузера, пристрій та файли cookie для покращення роботи сервісу.</li>
          </ul>

          <h2 className="text-2xl text-white mt-10 mb-4">2. Як ми використовуємо дані</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Ваша інформація використовується виключно для надання та покращення нашого сервісу:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-400 mb-6 marker:text-brand">
            <li>Генерація AI-аналізу, SWOT-аналізу та фінансових прогнозів для ваших ідей.</li>
            <li>Надання доступу до історії ваших проєктів.</li>
            <li>Обробка платежів (через захищених платіжних партнерів).</li>
            <li>Відправка важливих повідомлень щодо вашого акаунту або сервісу.</li>
          </ul>

          <h2 className="text-2xl text-white mt-10 mb-4">3. Захист та конфіденційність ідей</h2>
          <div className="bg-white/5 border border-gray-700 rounded-2xl p-6 mb-6">
            <p className="text-gray-300 leading-relaxed font-medium m-0">
              Ми поважаємо конфіденційність ваших бізнес-ідей. Вхідні дані (описи стартапів) обробляються автоматизованими алгоритмами виключно для генерації звітів і не передаються третім особам для їх власного використання або публікації.
            </p>
          </div>

          <h2 className="text-2xl text-white mt-10 mb-4">4. Використання AI та третіх сторін</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Для проведення аналізу ми використовуємо API від провідних провайдерів штучного інтелекту (наприклад, OpenAI або Anthropic). Дані передаються через захищені протоколи (SSL/TLS). Зверніть увагу, що ці провайдери не використовують ваші дані через API для навчання своїх публічних моделей згідно з їхніми політиками для корпоративних клієнтів.
          </p>

          <h2 className="text-2xl text-white mt-10 mb-4">5. Ваші права</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Ви маєте право у будь-який момент запитати доступ до своїх даних, виправити їх або видалити свій акаунт разом з усіма згенерованими звітами. Для цього скористайтеся налаштуваннями профілю або напишіть нам на пошту.
          </p>
          
          <hr className="my-10 border-gray-800" />
          
          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-white mb-2">Зв'яжіться з нами</h3>
            <p className="text-gray-400">
              Якщо у вас є запитання щодо нашої Політики конфіденційності, напишіть нам: <a href="mailto:privacy@checkit.ai" className="text-brand font-medium">privacy@checkit.ai</a>
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
