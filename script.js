// ============================================
// ИНИЦИАЛИЗАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

// Хранилище пользовательских рецептов
let userRecipes = JSON.parse(localStorage.getItem('customRecipes')) || {};
let selectedDishes = {};

// Функция для получения плоского списка всех блюд
function getAllDishes() {
    let allDishes = {};
    
    // Стандартные блюда
    for (const [category, subcategories] of Object.entries(dishes)) {
        for (const [subcategory, items] of Object.entries(subcategories)) {
            items.forEach(item => {
                allDishes[item.name] = item;
            });
        }
    }
    
    // Пользовательские рецепты
    for (const [category, subcategories] of Object.entries(userRecipes)) {
        for (const [subcategory, items] of Object.entries(subcategories)) {
            items.forEach(item => {
                allDishes[item.name] = item;
            });
        }
    }
    
    return allDishes;
}

let allDishesDB = getAllDishes();

// ============================================
// ГЕНЕРАЦИЯ МЕНЮ
// ============================================

// Генерация меню на 31 день
function generateMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = '';
    
    // Дни недели
    const weekdayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    
    // Генерируем 31 день
    for (let day = 1; day <= 31; day++) {
        const weekdayIndex = (day - 1) % 7;
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        dayCard.innerHTML = `
            <div class="day-header">
                ${weekdayNames[weekdayIndex]}<br>
                <small>${day} день</small>
            </div>
            <div class="meal-period breakfast">
                <div class="meal-title">
                    🍳 Завтрак
                </div>
                <div style="position: relative;">
                    <select class="meal-select" data-day="${day}" data-period="breakfast" onchange="updateShoppingList()">
                        <option value="">Выберите блюдо...</option>
                        ${generateOptions('Завтраки')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'breakfast')">📖</span>
                </div>
            </div>
            <div class="meal-period lunch">
                <div class="meal-title">
                    🍲 Обед
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch" onchange="updateShoppingList()">
                        <option value="">Выберите первое блюдо...</option>
                        ${generateOptions('Первые блюда')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'lunch')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch-main" onchange="updateShoppingList()">
                        <option value="">Выберите второе блюдо...</option>
                        ${generateOptions('Вторые блюда')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'lunch-main')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch-salad" onchange="updateShoppingList()">
                        <option value="">Выберите салат...</option>
                        ${generateOptions('Салаты')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'lunch-salad')">📖</span>
                </div>
            </div>
            <div class="meal-period dinner">
                <div class="meal-title">
                    🍽️ Ужин
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner" onchange="updateShoppingList()">
                        <option value="">Выберите основное блюдо...</option>
                        ${generateOptions('Ужин основное')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'dinner')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner-garnish" onchange="updateShoppingList()">
                        <option value="">Выберите гарнир...</option>
                        ${generateOptions('Ужин гарниры')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'dinner-garnish')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner-dessert" onchange="updateShoppingList()">
                        <option value="">Выберите десерт...</option>
                        ${generateOptions('Ужин десерты')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'dinner-dessert')">📖</span>
                </div>
            </div>
        `;
        
        menuGrid.appendChild(dayCard);
    }
    
    // Восстанавливаем сохранённые выборы
    setTimeout(() => {
        restoreSelectedDishes();
    }, 100);
}

// ============================================
// ГЕНЕРАЦИЯ ОПЦИЙ ДЛЯ ВЫБОРА
// ============================================

// Генерация опций для select
function generateOptions(category) {
    let options = '';
    
    // Стандартные блюда
    if (dishes[category]) {
        for (const [subcategory, items] of Object.entries(dishes[category])) {
            options += `<optgroup label="${subcategory}">`;
            items.forEach(item => {
                const dishName = typeof item === 'string' ? item : item.name;
                options += `<option value="${dishName}">${dishName}</option>`;
            });
            options += `</optgroup>`;
        }
    }
    
    // Пользовательские рецепты
    if (userRecipes[category]) {
        for (const [subcategory, items] of Object.entries(userRecipes[category])) {
            options += `<optgroup label="${subcategory} (мои)">`;
            items.forEach(item => {
                options += `<option value="${item.name}">${item.name} ★</option>`;
            });
            options += `</optgroup>`;
        }
    }
    
    return options;
}

// ============================================
// РАБОТА С РЕЦЕПТАМИ
// ============================================

// Показать рецепт для выбранного дня и периода
function showRecipeForDay(day, period) {
    const select = document.querySelector(`select[data-day="${day}"][data-period="${period}"]`);
    if (!select) {
        console.error(`Select not found for day ${day}, period ${period}`);
        return;
    }
    
    const dishName = select.value;
    if (!dishName) {
        alert('Сначала выберите блюдо!');
        return;
    }
    
    showRecipe(dishName);
}

// Показать рецепт
function showRecipe(dishName) {
    const dish = allDishesDB[dishName];
    if (!dish) {
        alert('Рецепт не найден!');
        return;
    }
    
    const recipeContent = document.getElementById('recipeContent');
    if (!recipeContent) return;
    
    // Формируем HTML для ингредиентов
    let ingredientsHTML = '';
    dish.ingredients.forEach(ing => {
        ingredientsHTML += `
            <div class="ingredient-grid">
                <span class="qty">${ing.qty}</span>
                <span class="name">${ing.name}</span>
            </div>
        `;
    });
    
    // Формируем HTML для шагов
    let stepsHTML = '';
    dish.steps.forEach((step, index) => {
        stepsHTML += `<li>${step}</li>`;
    });
    
    // Формируем HTML для советов
    let tipsHTML = '';
    if (dish.tips && dish.tips.length > 0) {
        dish.tips.forEach(tip => {
            tipsHTML += `<p>💡 ${tip}</p>`;
        });
    }
    
    // Вставляем контент в модальное окно
    recipeContent.innerHTML = `
        <div class="recipe-header">
            <h2>${dish.name}</h2>
            <div class="cuisine-tag">${dish.cuisine} кухня</div>
        </div>
        <div class="recipe-grid">
            <div class="recipe-section">
                <h3>📋 Ингредиенты</h3>
                ${ingredientsHTML}
            </div>
            <div class="recipe-section">
                <h3>👩‍🍳 Пошаговый рецепт</h3>
                <div class="steps">
                    <ol>
                        ${stepsHTML}
                    </ol>
                </div>
            </div>
        </div>
        ${tipsHTML ? `
        <div class="tips">
            <h4>💡 Советы шеф-повара</h4>
            ${tipsHTML}
        </div>
        ` : ''}
    `;
    
    // Показываем модальное окно
    document.getElementById('recipeModal').classList.add('active');
}

// Закрыть модальное окно рецепта
function closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// РАБОТА С МЕНЮ
// ============================================

// Заполнение случайными блюдами
function generateRandomMenu() {
    const selects = document.querySelectorAll('.meal-select');
    
    selects.forEach(select => {
        const options = select.querySelectorAll('option');
        if (options.length > 1) {
            const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
            select.selectedIndex = randomIndex;
        }
    });
    
    updateShoppingList();
}

// Сохранение меню
function saveMenu() {
    const menuData = {};
    const selects = document.querySelectorAll('.meal-select');
    
    selects.forEach(select => {
        const day = select.dataset.day;
        const period = select.dataset.period;
        const value = select.value;
        
        if (!menuData[day]) menuData[day] = {};
        if (value) menuData[day][period] = value;
    });
    
    // Создаём файл для скачивания
    const dataStr = JSON.stringify(menuData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `menu_31_days_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('✅ Меню успешно сохранено!');
}

// Сброс меню
function resetMenu() {
    if (confirm('Вы уверены, что хотите сбросить всё меню?')) {
        const selects = document.querySelectorAll('.meal-select');
        
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
        
        selectedDishes = {};
        updateShoppingList();
        
        alert('✅ Меню сброшено!');
    }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================

// Инициализация переключения вкладок
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке и вкладке
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
});

// ============================================
// СПИСОК ПОКУПОК
// ============================================

// Обновление списка покупок
function updateShoppingList() {
    selectedDishes = {};
    const selects = document.querySelectorAll('.meal-select');
    
    // Собираем все выбранные блюда
    selects.forEach(select => {
        const day = select.dataset.day;
        const period = select.dataset.period;
        const value = select.value;
        
        if (value) {
            if (!selectedDishes[day]) selectedDishes[day] = {};
            selectedDishes[day][period] = value;
        }
    });
    
    // Обновляем список ингредиентов и корзину покупок
    updateIngredientsList();
    updateShoppingCart();
}

// Обновление списка ингредиентов по блюдам
function updateIngredientsList() {
    const ingredientsList = document.getElementById('ingredientsList');
    if (!ingredientsList) return;
    
    // Если ничего не выбрано
    if (Object.keys(selectedDishes).length === 0) {
        ingredientsList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px 0;">Выберите блюда в меню, чтобы увидеть ингредиенты</p>';
        return;
    }
    
    let html = '';
    
    // Формируем список по дням
    for (const [day, periods] of Object.entries(selectedDishes)) {
        html += `<div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <strong style="color: #333; font-size: 1.1em;">📅 День ${day}</strong>
            <div style="margin-top: 10px;">`;
        
        for (const [period, dishName] of Object.entries(periods)) {
            const dish = allDishesDB[dishName];
            if (dish) {
                const periodName = getPeriodName(period);
                html += `
                    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        <strong style="color: #667eea;">${periodName}:</strong> 
                        <span style="color: #333; font-weight: bold;">${dishName}</span>
                        <div style="margin-top: 8px; padding-left: 15px; border-left: 2px solid #dee2e6;">`;
                
                dish.ingredients.forEach(ing => {
                    html += `<div style="color: #495057; margin-bottom: 3px;">• <strong>${ing.qty}</strong> ${ing.name}</div>`;
                });
                
                html += `</div></div>`;
            }
        }
        
        html += `</div></div>`;
    }
    
    ingredientsList.innerHTML = html;
}

// Обновление корзины покупок (суммарный список)
function updateShoppingCart() {
    const shoppingList = document.getElementById('shoppingList');
    if (!shoppingList) return;
    
    // Если ничего не выбрано
    if (Object.keys(selectedDishes).length === 0) {
        shoppingList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px 0;">Выберите блюда, чтобы сформировать список покупок</p>';
        return;
    }
    
    // Собираем все ингредиенты
    const allIngredients = {};
    
    for (const periods of Object.values(selectedDishes)) {
        for (const dishName of Object.values(periods)) {
            const dish = allDishesDB[dishName];
            if (dish) {
                dish.ingredients.forEach(ing => {
                    const key = ing.name;
                    if (!allIngredients[key]) {
                        allIngredients[key] = {qty: ing.qty, count: 1};
                    } else {
                        allIngredients[key].count++;
                    }
                });
            }
        }
    }
    
    // Категории ингредиентов для сортировки
    const categories = {
        '🥩 Мясо и рыба': ['говядина', 'баранина', 'свинина', 'курица', 'телятина', 'рыба', 'мясо', 'колбаса', 'ветчина', 'бекон', 'креветки', 'мидии', 'кальмары', 'лосось', 'судак', 'окунь', 'щука', 'хамон', 'чорисо'],
        '🥛 Молочные продукты': ['молоко', 'сыр', 'сметана', 'масло', 'йогурт', 'творог', 'сливки', 'фета', 'грюйер', 'пармезан', 'кефир', 'катык', 'ряженка', 'простокваша', 'моцарелла', 'бри', 'камамбер'],
        '🥬 Овощи и зелень': ['картофель', 'морковь', 'лук', 'помидор', 'огурец', 'капуста', 'свёкла', 'перец', 'чеснок', 'зелень', 'петрушка', 'укроп', 'редис', 'кабачок', 'баклажан', 'томат', 'салат', 'шпинат', 'порей', 'сельдерей', 'тыква', 'брокколи', 'цветная капуста', 'руккола', 'авокадо', 'шампиньоны', 'грибы', 'фенхель', 'артишок', 'спаржа'],
        '🌾 Крупы и макароны': ['крупа', 'рис', 'гречка', 'пшено', 'перловка', 'манная', 'овсянка', 'хлопья', 'макароны', 'лапша', 'вермишель', 'спагетти', 'паста', 'булгур', 'чечевица', 'фасоль', 'нут', 'горох', 'тофу'],
        '🍞 Мука и выпечка': ['мука', 'тесто', 'хлеб', 'булка', 'багет', 'лепёшка', 'блины', 'пирог', 'круассан', 'вафля', 'чебурек', 'пельмени', 'вареники', 'манты', 'хычин', 'дрожжи'],
        '🥚 Яйца': ['яйца', 'яйцо'],
        '🧂 Специи и приправы': ['соль', 'перец', 'лавровый лист', 'уксус', 'горчица', 'томатная паста', 'соус', 'специи', 'травы', 'орегано', 'тимьян', 'зира', 'куркума', 'кориандр', 'паприка', 'имбирь', 'корица', 'гвоздика', 'базилик', 'розмарин', 'чабрец', 'мята', 'кинза', 'эстрагон', 'майоран', 'душица', 'хмели-сунели', 'шафран', 'ванилин'],
        '🍯 Сладости': ['сахар', 'мёд', 'джем', 'варенье', 'сироп', 'шоколад', 'клён', 'ванильный сахар', 'какао'],
        '🫒 Масла и жиры': ['масло', 'маргарин', 'сливочное масло', 'растительное масло', 'оливковое масло', 'подсолнечное масло', 'кунжутное масло', 'кокосовое молоко', 'оливковое масло'],
        '🥫 Консервы': ['горошек', 'кукуруза', 'фасоль', 'грибы', 'маслины', 'каперсы', 'анчоусы', 'тунец', 'сардина', 'сайра', 'помидоры консервированные', 'томатная паста'],
        '🥜 Орехи и семечки': ['орехи', 'грецкие', 'миндаль', 'кешью', 'семечки', 'тыквы', 'кунжут', 'арахис', 'фундук', 'лесной орех'],
        '🍎 Фрукты и ягоды': ['яблоки', 'бананы', 'апельсины', 'лимон', 'лайм', 'клюква', 'изюм', 'чернослив', 'курага', 'финики', 'инжир', 'мандарины', 'грейпфрут', 'вишня', 'черешня', 'клубника', 'земляника', 'малина', 'смородина', 'крыжовник', 'персик', 'абрикос', 'слива', 'груша'],
        '🥤 Напитки': ['вода', 'квас', 'вино', 'пиво', 'водка', 'коньяк', 'ликёр', 'сок', 'морс', 'компот', 'чай', 'кофе', 'квас', 'лимонад', 'газировка']
    };
    
    let html = '';
    
    // Формируем список по категориям
    for (const [category, keywords] of Object.entries(categories)) {
        const categoryIngredients = {};
        
        for (const [name, data] of Object.entries(allIngredients)) {
            if (keywords.some(keyword => name.toLowerCase().includes(keyword))) {
                categoryIngredients[name] = data;
            }
        }
        
        if (Object.keys(categoryIngredients).length > 0) {
            html += `<div style="margin-bottom: 20px;">
                <strong style="color: #667eea; font-size: 1.3em; display: block; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">${category}</strong>
                <div style="margin-top: 10px;">`;
            
            for (const [name, data] of Object.entries(categoryIngredients).sort()) {
                html += `
                    <div class="ingredient-item" data-name="${name}">
                        <span style="flex: 1;">${name} — <strong>${data.qty}</strong>${data.count > 1 ? ` <small style="color: #6c757d;">(используется ${data.count} раз)</small>` : ''}</span>
                        <input type="checkbox" class="checkbox" onclick="toggleIngredient(this)">
                    </div>
                `;
            }
            
            html += `</div></div>`;
        }
    }
    
    // Остальные ингредиенты (не попавшие в категории)
    const otherIngredients = {};
    
    for (const [name, data] of Object.entries(allIngredients)) {
        let categorized = false;
        
        for (const keywords of Object.values(categories)) {
            if (keywords.some(keyword => name.toLowerCase().includes(keyword))) {
                categorized = true;
                break;
            }
        }
        
        if (!categorized) {
            otherIngredients[name] = data;
        }
    }
    
    if (Object.keys(otherIngredients).length > 0) {
        html += `<div style="margin-bottom: 20px;">
            <strong style="color: #667eea; font-size: 1.3em; display: block; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e9ecef;">📦 Прочее</strong>
            <div style="margin-top: 10px;">`;
        
        for (const [name, data] of Object.entries(otherIngredients).sort()) {
            html += `
                <div class="ingredient-item" data-name="${name}">
                    <span style="flex: 1;">${name} — <strong>${data.qty}</strong>${data.count > 1 ? ` <small style="color: #6c757d;">(используется ${data.count} раз)</small>` : ''}</span>
                    <input type="checkbox" class="checkbox" onclick="toggleIngredient(this)">
                </div>
            `;
        }
        
        html += `</div></div>`;
    }
    
    shoppingList.innerHTML = html;
}

// Переключение состояния ингредиента (куплен/не куплен)
function toggleIngredient(checkbox) {
    const item = checkbox.closest('.ingredient-item');
    if (item) {
        item.classList.toggle('checked');
    }
}

// Скачать список покупок
function downloadShoppingList() {
    const items = document.querySelectorAll('#shoppingList .ingredient-item');
    
    if (items.length === 0) {
        alert('Список покупок пуст!');
        return;
    }
    
    let text = '📋 СПИСОК ПОКУПОК\n';
    text += `Дата формирования: ${new Date().toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}\n`;
    text += '═'.repeat(50) + '\n\n';
    
    items.forEach(item => {
        const name = item.dataset.name;
        const qtyText = item.querySelector('span').textContent;
        const qty = qtyText.split('—')[1].split('(')[0].trim();
        const bought = item.classList.contains('checked') ? ' ✓ КУПЛЕНО' : '';
        text += `□ ${name.padEnd(30)} — ${qty.padEnd(15)}${bought}\n`;
    });
    
    text += '\n' + '═'.repeat(50) + '\n';
    text += 'Приятных покупок! 🛒\n';
    
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping_list_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    alert('✅ Список покупок успешно скачан!');
}

// Очистить список покупок
function clearShoppingList() {
    if (confirm('Очистить весь список покупок?\nЭто также сбросит все выбранные блюда в меню.')) {
        resetMenu();
    }
}

// ============================================
// НАВИГАЦИЯ МЕЖДУ ВКЛАДКАМИ
// ============================================

// Переключиться на вкладку меню
function switchToMenu() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector('[data-tab="menu"]').classList.add('active');
    document.getElementById('menu-tab').classList.add('active');
}

// Посмотреть список покупок
function viewShoppingList() {
    updateShoppingList();
    switchToShopping();
}

// Переключиться на вкладку покупок
function switchToShopping() {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const shoppingBtn = document.querySelector('[data-tab="shopping"]');
    const shoppingTab = document.getElementById('shopping-tab');
    
    if (shoppingBtn && shoppingTab) {
        shoppingBtn.classList.add('active');
        shoppingTab.classList.add('active');
    }
}

// Получить название периода
function getPeriodName(period) {
    const names = {
        'breakfast': '🍳 Завтрак',
        'lunch': '🍲 Первое (обед)',
        'lunch-main': '🍖 Второе (обед)',
        'lunch-salad': '🥗 Салат (обед)',
        'dinner': '🍽️ Основное (ужин)',
        'dinner-garnish': '🍚 Гарнир (ужин)',
        'dinner-dessert': '🍰 Десерт/напиток (ужин)'
    };
    
    return names[period] || period;
}

// Восстановить сохранённые выборы
function restoreSelectedDishes() {
    for (const [day, periods] of Object.entries(selectedDishes)) {
        for (const [period, dishName] of Object.entries(periods)) {
            const select = document.querySelector(`select[data-day="${day}"][data-period="${period}"]`);
            
            if (select) {
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === dishName) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }
}

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================

// Закрытие модального окна по клику вне его
window.onclick = function(event) {
    const recipeModal = document.getElementById('recipeModal');
    const addRecipeModal = document.getElementById('addRecipeModal');
    
    if (recipeModal && event.target === recipeModal) {
        closeRecipeModal();
    }
    
    if (addRecipeModal && event.target === addRecipeModal) {
        closeAddRecipeModal();
    }
}

// ============================================
// ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЬСКИХ РЕЦЕПТОВ
// ============================================

// Открыть модальное окно добавления рецепта
function openAddRecipeModal() {
    // Не очищаем поля формы, так как это делает браузер при отправке
    const modal = document.getElementById('addRecipeModal');
    modal.style.display = 'flex';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Генерируем меню на 31 день
    generateMenu();
    
    // Загружаем пользовательские рецепты
    userRecipes = JSON.parse(localStorage.getItem('customRecipes')) || {};
    
    // Обновляем базу данных
    allDishesDB = getAllDishes();
    
    console.log('✅ Приложение успешно инициализировано!');
});
