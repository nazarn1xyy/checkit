const fs = require('fs');

let html = fs.readFileSync('presentation.html', 'utf8');

const problemSlide = `
  <!-- СЛАЙД: Проблема -->
  <div class="slide">
    <div class="glow-brand" style="top: 20%; left: 30%"></div>
    <div class="content">
      <div class="flex justify-between items-center mb-16">
        <h2 class="text-5xl font-bold">Проблема: <span class="italic-serif text-6xl">90% ідей провалюються</span></h2>
        <div class="text-brand font-bold text-2xl tracking-widest uppercase slide-number"></div>
      </div>

      <div class="grid grid-cols-2 gap-12 flex-1 items-center">
        <div class="space-y-8">
          <div class="glass-panel p-8 border-l-4 border-l-red-500">
            <h3 class="text-3xl font-bold text-white mb-4">Брак знань та досвіду</h3>
            <p class="text-xl text-gray-400">Початківцям складно оцінити TAM/SAM/SOM, зробити конкурентний аналіз та побудувати юніт-економіку.</p>
          </div>
          <div class="glass-panel p-8 border-l-4 border-l-orange-500">
            <h3 class="text-3xl font-bold text-white mb-4">Втрата часу на дослідження</h3>
            <p class="text-xl text-gray-400">Ручний аналіз ринку та конкурентів забирає від кількох днів до тижнів.</p>
          </div>
          <div class="glass-panel p-8 border-l-4 border-l-brand">
            <h3 class="text-3xl font-bold text-white mb-4">Суб'єктивність</h3>
            <p class="text-xl text-gray-400">Засновники часто "закохуються" у свою ідею і не бачать очевидних ризиків та слабких місць.</p>
          </div>
        </div>
        <div class="flex justify-center items-center">
          <div class="text-center">
            <div class="text-9xl font-bold text-red-500 mb-4">9/10</div>
            <p class="text-3xl text-gray-400 italic-serif">стартапів закриваються<br>через відсутність ринку</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const solutionSlide = `
  <!-- СЛАЙД: Рішення -->
  <div class="slide">
    <div class="glow-brand-bottom"></div>
    <div class="content">
      <div class="flex justify-between items-center mb-16">
        <h2 class="text-5xl font-bold">Рішення: <span class="italic-serif text-6xl">CheckIt</span></h2>
        <div class="text-brand font-bold text-2xl tracking-widest uppercase slide-number"></div>
      </div>

      <div class="flex flex-1 gap-12 items-center">
        <div class="w-1/2">
          <p class="text-3xl text-gray-300 leading-relaxed mb-10">
            <strong>CheckIt</strong> — це AI-аналітик, який перетворює опис ідеї на повноцінний бізнес-звіт за кілька секунд.
          </p>
          <ul class="space-y-6 text-2xl text-gray-300">
            <li class="flex items-center"><svg class="w-8 h-8 text-brand mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Валідація ідей у реальному часі</li>
            <li class="flex items-center"><svg class="w-8 h-8 text-brand mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Об'єктивна оцінка на основі даних</li>
            <li class="flex items-center"><svg class="w-8 h-8 text-brand mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Економія десятків годин на ресерч</li>
          </ul>
        </div>
        
        <div class="w-1/2 flex justify-center">
          <div class="glass-panel p-10 relative text-center">
            <div class="w-24 h-24 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="text-4xl font-bold text-white mb-4">Від ідеї до звіту</h3>
            <p class="text-2xl text-gray-400">Менше ніж за 30 секунд</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Insert the new slides right before СЛАЙД 2
const insertMarker = '<!-- СЛАЙД 2: Дії користувача -->';
html = html.replace(insertMarker, problemSlide + '\n' + solutionSlide + '\n' + insertMarker);

// Change the old slide numbers to use class slide-number
html = html.replace(/<div class="text-brand font-bold text-2xl tracking-widest uppercase">\d+<\/div>/g, '<div class="text-brand font-bold text-2xl tracking-widest uppercase slide-number"></div>');

// Renumber all elements with class slide-number
let count = 2; // Since Slide 1 doesn't have a number
html = html.replace(/<div class="text-brand font-bold text-2xl tracking-widest uppercase slide-number"><\/div>/g, () => {
    let num = count.toString().padStart(2, '0');
    count++;
    return `<div class="text-brand font-bold text-2xl tracking-widest uppercase">${num}</div>`;
});

fs.writeFileSync('presentation.html', html);
console.log('Slides added and renumbered successfully!');
