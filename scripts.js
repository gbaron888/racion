// Глобальные переменные
let currentMenu = {};
let shoppingList = {};
const DAYS_IN_MONTH = 31;
const CATEGORIES = [
    'Мясо и рыба', 'Молочные продукты', 'Овощи и зелень',
    'Крупы и макароны', 'Мука и выпечка', 'Яйца',
    'Специи и приправы', 'Сладости', 'Масла и жиры',
    'Консервы', 'Орехи и семечки', 'Фрукты и ягоды', 'Прочее'
];

// ========== КОНСТАНТЫ СЛОТОВ ==========
const MEAL_SLOTS = {
    breakfast: { name: 'Завтрак', icon: '🌅', section: 'breakfast', type: 'breakfast' },
    'soup-lunch': { name: 'Первое блюдо', icon: '🍲', section: 'lunch', type: 'soup' },
    'main-lunch': { name: 'Второе блюдо', icon: '🍖', section: 'lunch', type: 'main' },
    'salad-lunch': { name: 'Салат', icon: '🥗', section: 'lunch', type: 'salad' },
    'main-dinner': { name: 'Основное блюдо', icon: '🍖', section: 'dinner', type: 'main' },
    'garnish-dinner': { name: 'Гарнир', icon: '🍚', section: 'dinner', type: 'garnish' },
    'dessert-dinner': { name: 'Десерт', icon: '🍰', section: 'dinner', type: 'dessert' },
    'drink-dinner': { name: 'Напиток', icon: '🥤', section: 'dinner', type: 'drink' }
};

// Глобальные переменные для выбора блюда
let currentSelection = {
    day: null,
    slotId: null,  // Уникальный идентификатор слота
    mealType: null,
    category: null,
    subcategory: null,
    dishIndex: null,
    quantity: 1
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadSavedMenu();
});

function initializeApp() {
    // Проверка целостности базы рецептов
    if (!recipesDatabase || Object.keys(recipesDatabase).length === 0) {
        showNotification('Ошибка загрузки базы рецептов!', 'error');
        console.error('База рецептов недоступна');
        return;
    }
    
    setupEventListeners();
    generateDaysGrid();
    updateShoppingListDisplay();
    initSelectorEventListeners();
    
    // Отладочное сообщение для мобильных устройств
    if (window.innerWidth <= 768) {
        console.log('📱 Мобильное устройство обнаружено. Разрешение:', window.innerWidth);
        console.log('📚 Доступные категории:', Object.keys(recipesDatabase));
    }
}

function setupEventListeners() {
    // Вкладки навигации
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    // Кнопки управления меню
    const randomFillBtn = document.getElementById('random-fill');
    const resetMenuBtn = document.getElementById('reset-menu');
    const saveMenuBtn = document.getElementById('save-menu');
    const loadMenuBtn = document.getElementById('load-menu');
    const fileInput = document.getElementById('file-input');
    
    if (randomFillBtn) randomFillBtn.addEventListener('click', fillMenuRandomly);
    if (resetMenuBtn) resetMenuBtn.addEventListener('click', resetMenu);
    if (saveMenuBtn) saveMenuBtn.addEventListener('click', saveMenu);
    if (loadMenuBtn) loadMenuBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });
    if (fileInput) fileInput.addEventListener('change', loadMenuFromFile);

    // Кнопки списка покупок
    const exportShoppingBtn = document.getElementById('export-shopping');
    const clearShoppingBtn = document.getElementById('clear-shopping');
    
    if (exportShoppingBtn) exportShoppingBtn.addEventListener('click', exportShoppingList);
    if (clearShoppingBtn) clearShoppingBtn.addEventListener('click', clearShoppingList);

    // Форма добавления рецепта
    const recipeForm = document.getElementById('recipe-form');
    if (recipeForm) recipeForm.addEventListener('submit', addCustomRecipe);

    // Модальное окно рецепта
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('recipe-modal')) {
            closeModal();
        }
    });
}

function switchTab(tabId) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку и активировать кнопку
    const tabElement = document.getElementById(`${tabId}-tab`);
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (tabElement) tabElement.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
}

function generateDaysGrid() {
    const daysGrid = document.getElementById('days-grid');
    if (!daysGrid) {
        console.error('Элемент #days-grid не найден');
        return;
    }
    
    daysGrid.innerHTML = '';
    
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
        const dayCard = createDayCard(day);
        daysGrid.appendChild(dayCard);
    }
}

function createDayCard(day) {
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.dataset.day = day;
    
    const today = new Date();
    const currentDay = today.getDate();
    const isToday = day === currentDay;
    
    // Генерируем уникальные слоты для каждого приема пищи
    let slotsHTML = '';
    
    // Завтрак
    slotsHTML += `
        <div class="meal-section breakfast">
            <div class="meal-title">🥣 Завтрак <span class="meal-category">(выберите)</span></div>
            <div class="meal-items" id="slot-${day}-breakfast"></div>
        </div>
    `;
    
    // Обед
    slotsHTML += `
        <div class="meal-section lunch">
            <div class="meal-title">🍲 Обед</div>
            <div class="meal-subsection">
                <div class="meal-title">Первое блюдо <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-soup-lunch"></div>
            </div>
            <div class="meal-subsection">
                <div class="meal-title">Второе блюдо <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-main-lunch"></div>
            </div>
            <div class="meal-subsection">
                <div class="meal-title">Салат <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-salad-lunch"></div>
            </div>
        </div>
    `;
    
    // Ужин
    slotsHTML += `
        <div class="meal-section dinner">
            <div class="meal-title">🍽️ Ужин</div>
            <div class="meal-subsection">
                <div class="meal-title">Основное блюдо <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-main-dinner"></div>
            </div>
            <div class="meal-subsection">
                <div class="meal-title">Гарнир <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-garnish-dinner"></div>
            </div>
            <div class="meal-subsection">
                <div class="meal-title">Десерт/Напиток <span class="meal-category">(выберите)</span></div>
                <div class="meal-items" id="slot-${day}-dessert-dinner"></div>
                <div class="meal-items" id="slot-${day}-drink-dinner"></div>
            </div>
        </div>
    `;
    
    dayCard.innerHTML = `
        <div class="day-header">
            <div>
                <div class="day-number">${day}</div>
                <div class="day-date">${isToday ? 'Сегодня' : getDayOfWeek(day)}</div>
            </div>
            ${day > 1 ? `<button class="btn btn-secondary btn-sm same-as-previous" data-day="${day}">🔄 То же, что и вчера</button>` : ''}
        </div>
        ${slotsHTML}
    `;
    
    // Добавить обработчики для кнопки "То же, что и вчера"
    if (day > 1) {
        const sameBtn = dayCard.querySelector('.same-as-previous');
        if (sameBtn) {
            sameBtn.addEventListener('click', () => copyPreviousDay(day));
        }
    }
    
    return dayCard;
}

function getDayOfWeek(day) {
    const date = new Date();
    date.setDate(day);
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[date.getDay()];
}

function copyPreviousDay(day) {
    if (day <= 1) return;
    
    const prevDayData = currentMenu[day - 1];
    if (!prevDayData?.slots) {
        showNotification('Нет данных за предыдущий день', 'error');
        return;
    }
    
    // Глубокое копирование слотов
    currentMenu[day] = {
        slots: JSON.parse(JSON.stringify(prevDayData.slots))
    };
    
    renderDayMenu(day);
    updateShoppingList();
    saveToLocalStorage();
    showNotification('Меню скопировано с предыдущего дня', 'success');
}

function renderDayMenu(day) {
    const dayData = currentMenu[day] || { slots: {} };
    
    // Рендерим каждый слот по уникальному ID
    Object.keys(MEAL_SLOTS).forEach(slotId => {
        const slotData = dayData.slots?.[slotId];
        const slotElement = document.getElementById(`slot-${day}-${slotId}`);
        
        if (slotElement) {
            renderSlot(slotElement, day, slotId, slotData);
        } else {
            console.warn(`Элемент слота не найден: slot-${day}-${slotId}`);
        }
    });
}

function renderSlot(container, day, slotId, slotData) {
    // Получаем тип блюда из конфигурации слота
    const slotConfig = MEAL_SLOTS[slotId];
    const mealType = slotConfig.type;
    
    if (!slotData) {
        container.innerHTML = `
            <div class="meal-item empty" onclick="openMealSelector(${day}, '${slotId}', '${mealType}')">
                ➕ Выбрать блюдо
            </div>
        `;
        return;
    }
    
    const recipe = findRecipeByPath(slotData.path);
    if (!recipe) {
        container.innerHTML = `
            <div class="meal-item empty" onclick="openMealSelector(${day}, '${slotId}', '${mealType}')">
                ➕ Выбрать блюдо
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="meal-item">
            <div class="meal-content">
                <span class="meal-name" onclick="openRecipeModal('${mealType}', '${slotData.path.join('|')}')">
                    ${recipe.name}
                </span>
                ${slotData.quantity > 1 ? `<span class="quantity-badge">×${slotData.quantity}</span>` : ''}
            </div>
            <div class="meal-actions">
                <button class="btn-action btn-edit" title="Изменить" 
                        onclick="editMeal(${day}, '${slotId}')">✏️</button>
                <button class="btn-action btn-quantity" title="Количество" 
                        onclick="changeQuantity(${day}, '${slotId}')">🔢</button>
                <button class="btn-action btn-delete" title="Удалить" 
                        onclick="deleteMeal(${day}, '${slotId}')">🗑️</button>
            </div>
        </div>
    `;
}

function findRecipeByPath(pathArray) {
    if (!pathArray || pathArray.length < 3) {
        console.error('Неверный путь к рецепту:', pathArray);
        return null;
    }
    
    try {
        let current = recipesDatabase;
        
        // Пройти по всем уровням пути, кроме последнего (индекс блюда)
        for (let i = 0; i < pathArray.length - 1; i++) {
            const key = pathArray[i];
            if (current[key]) {
                current = current[key];
            } else {
                console.error(`Путь не найден: ${pathArray.slice(0, i + 1).join('/')}`);
                return null;
            }
        }
        
        // Последний элемент - индекс блюда в массиве
        const dishIndex = parseInt(pathArray[pathArray.length - 1]);
        if (Array.isArray(current) && current[dishIndex]) {
            return current[dishIndex];
        }
        
        console.error('Блюдо не найдено по индексу:', dishIndex);
        return null;
    } catch (error) {
        console.error('Ошибка при поиске рецепта:', error);
        return null;
    }
}

// ========== ФУНКЦИИ УПРАВЛЕНИЯ БЛЮДАМИ ==========

// Открыть селектор блюд
function openMealSelector(day, slotId, mealType = null) {
    // Если тип не передан, определяем из конфигурации
    const slotConfig = MEAL_SLOTS[slotId];
    const actualMealType = mealType || slotConfig.type;
    
    currentSelection = {
        day: parseInt(day),
        slotId: slotId,
        mealType: actualMealType,
        category: null,
        subcategory: null,
        dishIndex: null,
        quantity: 1
    };
    
    // Показать первый шаг - выбор категории
    showSelectorStep('category');
    renderCategories(actualMealType);
    const modal = document.getElementById('meal-selector-modal');
    if (modal) modal.style.display = 'block';
}

// Изменить блюдо
function editMeal(day, slotId) {
    const dayData = currentMenu[day];
    const slotData = dayData?.slots?.[slotId];
    
    if (!slotData) {
        openMealSelector(day, slotId);
        return;
    }
    
    // Получаем тип блюда из пути
    const mealType = slotData.path[0];
    
    currentSelection = {
        day: parseInt(day),
        slotId: slotId,
        mealType: mealType,
        category: null,
        subcategory: slotData.path[1],
        dishIndex: slotData.path[2],
        quantity: slotData.quantity
    };
    
    showSelectorStep('dish');
    renderDishes(mealType, slotData.path[1]);
    document.getElementById('dish-title').textContent = `Изменить блюдо`;
    document.getElementById('meal-selector-modal').style.display = 'block';
}

// Изменить количество порций
function changeQuantity(day, slotId) {
    const dayData = currentMenu[day];
    const slotData = dayData?.slots?.[slotId];
    
    if (!slotData) {
        showNotification('Сначала выберите блюдо', 'error');
        return;
    }
    
    const recipe = findRecipeByPath(slotData.path);
    if (!recipe) {
        showNotification('Рецепт не найден', 'error');
        return;
    }
    
    // Создать модальное окно для выбора количества
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quantity-modal';
    modal.innerHTML = `
        <div class="modal-content quantity-modal">
            <span class="close-btn" onclick="closeQuantityModal()">&times;</span>
            <h2>Изменить количество порций</h2>
            <p><strong>${recipe.name}</strong></p>
            <div class="quantity-options">
                <div class="quantity-option" data-qty="1">1 порция</div>
                <div class="quantity-option" data-qty="2">2 порции</div>
                <div class="quantity-option" data-qty="3">3 порции</div>
                <div class="quantity-option" data-qty="4">4 порции</div>
                <div class="quantity-option" data-qty="5">5 порций</div>
                <div class="quantity-option custom-qty">Другое...</div>
            </div>
            <div id="custom-quantity-input" style="display: none; margin-top: 20px;">
                <input type="number" id="custom-qty" min="1" value="${slotData.quantity}" 
                       class="quantity-input" style="width: 100%; padding: 10px; font-size: 18px;">
                <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" 
                        onclick="applyCustomQuantity(${day}, '${slotId}')">Применить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавить обработчики для стандартных вариантов
    modal.querySelectorAll('.quantity-option').forEach(option => {
        option.addEventListener('click', function() {
            if (this.classList.contains('custom-qty')) {
                document.getElementById('custom-quantity-input').style.display = 'block';
                return;
            }
            
            const qty = parseInt(this.dataset.qty);
            applyQuantityChange(day, slotId, qty);
            closeQuantityModal();
        });
    });
}

// Применить изменение количества
function applyQuantityChange(day, slotId, quantity) {
    if (!currentMenu[day]?.slots?.[slotId]) {
        showNotification('Ошибка: блюдо не найдено', 'error');
        return;
    }
    
    currentMenu[day].slots[slotId].quantity = quantity;
    renderDayMenu(day);
    updateShoppingList();
    saveToLocalStorage();
    showNotification(`Количество изменено на ${quantity} порц${getPortionEnding(quantity)}`, 'success');
}

// Применить кастомное количество
function applyCustomQuantity(day, slotId) {
    const qtyInput = document.getElementById('custom-qty');
    if (!qtyInput) return;
    
    const qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) {
        showNotification('Количество должно быть больше 0', 'error');
        return;
    }
    
    applyQuantityChange(day, slotId, qty);
}

// Получить правильное окончание слова "порция"
function getPortionEnding(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'ия';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'ии';
    return 'ий';
}

// Закрыть модальное окно количества
function closeQuantityModal() {
    const modal = document.getElementById('quantity-modal');
    if (modal) modal.remove();
}

// Удалить блюдо
function deleteMeal(day, slotId) {
    if (!currentMenu[day]?.slots?.[slotId]) return;
    
    const recipe = findRecipeByPath(currentMenu[day].slots[slotId].path);
    const dishName = recipe?.name || 'блюдо';
    
    if (confirm(`Удалить "${dishName}" из меню?`)) {
        delete currentMenu[day].slots[slotId];
        
        // Если все слоты удалены, удаляем день
        if (Object.keys(currentMenu[day].slots).length === 0) {
            delete currentMenu[day];
        }
        
        renderDayMenu(day);
        updateShoppingList();
        saveToLocalStorage();
        showNotification(`"${dishName}" удалено из меню`, 'success');
    }
}

// ========== ФУНКЦИИ РЕЦЕПТОВ ==========

function openRecipeModal(mealType, pathString) {
    const path = pathString.split('|');
    const recipe = findRecipeByPath(path);
    
    if (!recipe) {
        showNotification('Рецепт не найден', 'error');
        return;
    }
    
    const modal = document.getElementById('recipe-modal');
    const modalTitle = document.getElementById('modal-title');
    const ingredientsBody = document.getElementById('ingredients-body');
    const stepsList = document.getElementById('modal-steps');
    const tipsSection = document.getElementById('modal-tips-section');
    const tipsText = document.getElementById('modal-tips');
    
    if (!modal || !modalTitle || !ingredientsBody || !stepsList) {
        console.error('Элементы модального окна не найдены');
        return;
    }
    
    modalTitle.textContent = recipe.name;
    
    // Очистить предыдущие данные
    ingredientsBody.innerHTML = '';
    stepsList.innerHTML = '';
    
    // Заполнить ингредиенты
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ingredient.name || ''}</td>
                <td>${ingredient.quantity || ''}</td>
            `;
            ingredientsBody.appendChild(row);
        });
    }
    
    // Заполнить шаги
    if (recipe.steps && Array.isArray(recipe.steps)) {
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });
    }
    
    // Заполнить советы
    if (recipe.tips && tipsSection && tipsText) {
        tipsText.textContent = recipe.tips;
        tipsSection.style.display = 'block';
    } else if (tipsSection) {
        tipsSection.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('recipe-modal');
    if (modal) modal.style.display = 'none';
}

// ========== ФУНКЦИИ ГЕНЕРАЦИИ МЕНЮ ==========

function fillMenuRandomly() {
    if (confirm('Вы уверены? Это перезапишет текущее меню.')) {
        currentMenu = {};
        
        for (let day = 1; day <= DAYS_IN_MONTH; day++) {
            currentMenu[day] = { slots: {} };
            
            // Заполняем каждый слот случайным блюдом
            Object.entries(MEAL_SLOTS).forEach(([slotId, config]) => {
                const randomMeal = getRandomMeal(config.type);
                if (randomMeal) {
                    currentMenu[day].slots[slotId] = randomMeal;
                }
            });
        }
        
        renderAllDays();
        updateShoppingList();
        saveToLocalStorage();
        showNotification('Меню заполнено случайными блюдами', 'success');
    }
}

function getRandomMeal(mealType) {
    const mealCategories = recipesDatabase[mealType];
    if (!mealCategories) {
        console.error(`Категория ${mealType} не найдена`);
        return null;
    }
    
    const categories = Object.keys(mealCategories);
    if (categories.length === 0) {
        console.error(`Нет подкатегорий для ${mealType}`);
        return null;
    }
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const dishes = recipesDatabase[mealType][randomCategory];
    
    if (!dishes || dishes.length === 0) {
        console.error(`Нет блюд в категории ${mealType}/${randomCategory}`);
        return null;
    }
    
    const randomDishIndex = Math.floor(Math.random() * dishes.length);
    
    return {
        path: [mealType, randomCategory, randomDishIndex],
        quantity: 1
    };
}

function resetMenu() {
    if (confirm('Вы уверены? Это удалит все данные меню.')) {
        currentMenu = {};
        renderAllDays();
        updateShoppingList();
        localStorage.removeItem('mealPlannerMenu');
        localStorage.removeItem('mealPlannerShopping');
        showNotification('Меню сброшено', 'info');
    }
}

function renderAllDays() {
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
        renderDayMenu(day);
    }
}

// ========== ФУНКЦИИ СПИСКА ПОКУПОК ==========

function updateShoppingList() {
    shoppingList = {};
    
    // Проходим по всем дням и слотам
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
        const dayData = currentMenu[day];
        if (!dayData?.slots) continue;
        
        // Проходим по всем слотам дня
        Object.values(dayData.slots).forEach(slot => {
            if (!slot) return;
            
            const recipe = findRecipeByPath(slot.path);
            if (!recipe?.ingredients) return;
            
            recipe.ingredients.forEach(ingredient => {
                if (!ingredient.name) return;
                
                const key = ingredient.name.toLowerCase();
                const quantityValue = parseFloat(ingredient.quantity) || 0;
                
                if (!shoppingList[key]) {
                    shoppingList[key] = {
                        name: ingredient.name,
                        quantity: quantityValue * slot.quantity || 0,
                        unit: getUnitFromQuantity(ingredient.quantity),
                        checked: false
                    };
                } else {
                    shoppingList[key].quantity += quantityValue * slot.quantity || 0;
                }
            });
        });
    }
    
    updateShoppingListDisplay();
}

function getUnitFromQuantity(quantityString) {
    if (!quantityString) return '';
    
    const match = quantityString.match(/([а-яА-ЯёЁa-zA-Z]+)/);
    return match ? match[0] : '';
}

function updateShoppingListDisplay() {
    const categoriesContainer = document.getElementById('shopping-categories');
    if (!categoriesContainer) {
        console.error('Элемент #shopping-categories не найден');
        return;
    }
    
    categoriesContainer.innerHTML = '';
    
    if (Object.keys(shoppingList).length === 0) {
        categoriesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div class="empty-state-text">Список покупок пуст</div>
                <div class="empty-state-subtext">Добавьте блюда в меню, чтобы сформировать список покупок</div>
            </div>
        `;
        return;
    }
    
    // Группировать ингредиенты по категориям
    const categorized = {};
    CATEGORIES.forEach(cat => categorized[cat] = []);
    
    Object.values(shoppingList).forEach(item => {
        const category = categorizeIngredient(item.name);
        categorized[category].push(item);
    });
    
    // Отобразить категории
    CATEGORIES.forEach(category => {
        if (categorized[category].length > 0) {
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `<h3 class="category-title">${category}</h3>`;
            
            const ingredientsList = document.createElement('div');
            
            categorized[category].forEach(item => {
                const ingredientItem = document.createElement('div');
                ingredientItem.className = `ingredient-item ${item.checked ? 'checked' : ''}`;
                ingredientItem.innerHTML = `
                    <input type="checkbox" class="ingredient-checkbox" 
                           data-name="${item.name}"
                           ${item.checked ? 'checked' : ''}>
                    <span class="ingredient-name">${item.name}</span>
                    <span class="ingredient-quantity">${item.quantity.toFixed(1)} ${item.unit}</span>
                `;
                ingredientsList.appendChild(ingredientItem);
            });
            
            categorySection.appendChild(ingredientsList);
            categoriesContainer.appendChild(categorySection);
        }
    });
    
    // Добавить обработчики для чекбоксов
    document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const name = this.dataset.name;
            toggleIngredient(name);
        });
    });
}

function categorizeIngredient(ingredientName) {
    if (!ingredientName) return 'Прочее';
    
    const name = ingredientName.toLowerCase();
    
    if (name.includes('мясо') || name.includes('рыба') || name.includes('курица') || 
        name.includes('говядина') || name.includes('свинина') || name.includes('баранина') ||
        name.includes('креветки') || name.includes('кальмар') || name.includes('треска') ||
        name.includes('филе') || name.includes('колбаса') || name.includes('ветчина')) {
        return 'Мясо и рыба';
    }
    
    if (name.includes('молоко') || name.includes('сыр') || name.includes('творог') || 
        name.includes('сметана') || name.includes('йогурт') || name.includes('сливки') ||
        name.includes('масло сливочное') || name.includes('кефир') || name.includes('ряженка') ||
        name.includes('маскарпоне') || name.includes('моцарелла') || name.includes('пармезан')) {
        return 'Молочные продукты';
    }
    
    if (name.includes('овощ') || name.includes('зелень') || name.includes('помидор') || 
        name.includes('огурец') || name.includes('морковь') || name.includes('капуста') ||
        name.includes('лук') || name.includes('чеснок') || name.includes('перец') ||
        name.includes('картофель') || name.includes('свекла') || name.includes('укроп') ||
        name.includes('петрушка') || name.includes('салат') || name.includes('брокколи') ||
        name.includes('баклажан') || name.includes('кабачок') || name.includes('тыква') ||
        name.includes('шпинат') || name.includes('базилик') || name.includes('кориандр')) {
        return 'Овощи и зелень';
    }
    
    if (name.includes('крупа') || name.includes('рис') || name.includes('гречка') || 
        name.includes('пшено') || name.includes('овсянка') || name.includes('перловка') ||
        name.includes('манка') || name.includes('булгур') || name.includes('кускус') ||
        name.includes('макароны') || name.includes('вермишель') || name.includes('лапша') ||
        name.includes('спагетти') || name.includes('паста')) {
        return 'Крупы и макароны';
    }
    
    if (name.includes('мука') || name.includes('дрожжи') || name.includes('сахар') || 
        name.includes('мед') || name.includes('шоколад') || name.includes('какао') ||
        name.includes('печенье') || name.includes('хлеб') || name.includes('булка') ||
        name.includes('тесто') || name.includes('сдоба') || name.includes('круассан')) {
        return 'Мука и выпечка';
    }
    
    if (name.includes('яйцо') || name.includes('яичный') || name.includes('яичные')) {
        return 'Яйца';
    }
    
    if (name.includes('специя') || name.includes('приправа') || name.includes('соль') || 
        name.includes('перец') || name.includes('корица') || name.includes('ванилин') ||
        name.includes('лавровый лист') || name.includes('укроп') || name.includes('петрушка') ||
        name.includes('куркума') || name.includes('имбирь') || name.includes('гвоздика') ||
        name.includes('орегано') || name.includes('тимьян') || name.includes('розмарин')) {
        return 'Специи и приправы';
    }
    
    if (name.includes('сахар') || name.includes('мед') || name.includes('шоколад') || 
        name.includes('конфета') || name.includes('варенье') || name.includes('джем') ||
        name.includes('сироп') || name.includes('зефир') || name.includes('мармелад')) {
        return 'Сладости';
    }
    
    if (name.includes('масло') || name.includes('жир') || name.includes('маргарин') ||
        name.includes('оливковое') || name.includes('подсолнечное') || name.includes('кокосовое')) {
        return 'Масла и жиры';
    }
    
    if (name.includes('консервы') || name.includes('тушенка') || name.includes('сгущенка') ||
        name.includes('вымочка') || name.includes('маринованный') || name.includes('соленый')) {
        return 'Консервы';
    }
    
    if (name.includes('орех') || name.includes('семечки') || name.includes('кунжут') || 
        name.includes('миндаль') || name.includes('грецкий орех') || name.includes('фундук') ||
        name.includes('арахис') || name.includes('кешью') || name.includes('фисташки')) {
        return 'Орехи и семечки';
    }
    
    if (name.includes('фрукт') || name.includes('ягода') || name.includes('яблоко') || 
        name.includes('банан') || name.includes('апельсин') || name.includes('лимон') ||
        name.includes('клубника') || name.includes('малина') || name.includes('вишня') ||
        name.includes('груша') || name.includes('персик') || name.includes('манго') ||
        name.includes('ананас') || name.includes('виноград') || name.includes('киви')) {
        return 'Фрукты и ягоды';
    }
    
    return 'Прочее';
}

function toggleIngredient(ingredientName) {
    const key = ingredientName.toLowerCase();
    if (shoppingList[key]) {
        shoppingList[key].checked = !shoppingList[key].checked;
        updateShoppingListDisplay();
        saveToLocalStorage();
    }
}

// ========== ФУНКЦИИ ЭКСПОРТА/ИМПОРТА ==========

function saveMenu() {
    const menuData = {
        menu: currentMenu,
        shoppingList: shoppingList,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(menuData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-planner-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Меню сохранено в файл', 'success');
}

function loadMenuFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            currentMenu = data.menu || {};
            shoppingList = data.shoppingList || {};
            renderAllDays();
            updateShoppingListDisplay();
            saveToLocalStorage();
            showNotification('Меню успешно загружено!', 'success');
        } catch (error) {
            showNotification('Ошибка при загрузке файла: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function exportShoppingList() {
    let content = `Список покупок - ${new Date().toLocaleDateString('ru-RU')}\n`;
    content += `========================\n\n`;
    
    let totalItems = 0;
    
    CATEGORIES.forEach(category => {
        const items = Object.values(shoppingList).filter(item => 
            categorizeIngredient(item.name) === category && !item.checked
        );
        
        if (items.length > 0) {
            content += `${category}:\n`;
            items.forEach(item => {
                content += `☐ ${item.name} - ${item.quantity.toFixed(1)} ${item.unit}\n`;
                totalItems++;
            });
            content += '\n';
        }
    });
    
    if (totalItems === 0) {
        content += 'Список покупок пуст или все товары отмечены как купленные.\n';
    } else {
        content += `========================\n`;
        content += `Всего товаров: ${totalItems}\n`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Список покупок экспортирован', 'success');
}

function clearShoppingList() {
    if (confirm('Очистить список покупок? Отмеченные как купленные товары будут удалены.')) {
        let removedCount = 0;
        Object.keys(shoppingList).forEach(key => {
            if (shoppingList[key].checked) {
                delete shoppingList[key];
                removedCount++;
            }
        });
        updateShoppingListDisplay();
        saveToLocalStorage();
        showNotification(`Удалено ${removedCount} купленных товаров`, 'success');
    }
}

function addCustomRecipe(e) {
    e.preventDefault();
    
    const recipeData = {
        name: document.getElementById('recipe-name')?.value.trim() || '',
        cuisine: document.getElementById('recipe-cuisine')?.value || '',
        category: document.getElementById('recipe-category')?.value || '',
        ingredients: (document.getElementById('recipe-ingredients')?.value || '')
            .split('\n')
            .map(i => i.trim())
            .filter(i => i),
        steps: (document.getElementById('recipe-steps')?.value || '')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s),
        tips: document.getElementById('recipe-tips')?.value.trim() || ''
    };
    
    // Валидация
    if (!recipeData.name) {
        showNotification('Введите название блюда', 'error');
        return;
    }
    
    if (recipeData.ingredients.length === 0) {
        showNotification('Введите хотя бы один ингредиент', 'error');
        return;
    }
    
    if (recipeData.steps.length === 0) {
        showNotification('Введите хотя бы один шаг приготовления', 'error');
        return;
    }
    
    // Отправка на почту (заглушка)
    showNotification(`Рецепт "${recipeData.name}" отправлен на baron888@ya.ru для модерации`, 'success');
    
    // Очистить форму
    const form = document.getElementById('recipe-form');
    if (form) form.reset();
}

// ========== ЛОКАЛЬНОЕ ХРАНЕНИЕ ==========

function saveToLocalStorage() {
    try {
        localStorage.setItem('mealPlannerMenu', JSON.stringify(currentMenu));
        localStorage.setItem('mealPlannerShopping', JSON.stringify(shoppingList));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
        showNotification('Ошибка сохранения данных', 'error');
    }
}

function loadSavedMenu() {
    try {
        const savedMenu = localStorage.getItem('mealPlannerMenu');
        const savedShopping = localStorage.getItem('mealPlannerShopping');
        
        if (savedMenu) {
            currentMenu = JSON.parse(savedMenu);
            renderAllDays();
        }
        
        if (savedShopping) {
            shoppingList = JSON.parse(savedShopping);
            updateShoppingListDisplay();
        }
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        showNotification('Ошибка загрузки сохраненных данных', 'error');
    }
}

// ========== ФУНКЦИИ ВЫБОРА БЛЮД ==========

// Показать шаг селектора
function showSelectorStep(step) {
    document.querySelectorAll('.selector-step').forEach(el => {
        el.classList.remove('active');
    });
    
    let stepId;
    switch(step) {
        case 'category': stepId = 'step-category'; break;
        case 'subcategory': stepId = 'step-subcategory'; break;
        case 'dish': stepId = 'step-dish'; break;
        case 'quantity': stepId = 'step-quantity'; break;
        default: stepId = 'step-category';
    }
    
    const stepElement = document.getElementById(stepId);
    if (stepElement) stepElement.classList.add('active');
}

function renderCategories(mealType) {
    const grid = document.getElementById('categories-grid');
    if (!grid) {
        console.error('Элемент #categories-grid не найден');
        return;
    }
    
    grid.innerHTML = '';
    
    const categoriesConfig = {
        breakfast: [
            { id: 'porridge', name: 'Каши', icon: '🥣' },
            { id: 'eggs', name: 'Яичные блюда', icon: '🍳' },
            { id: 'baking', name: 'Выпечка', icon: '🍞' },
            { id: 'national', name: 'Национальные', icon: '🌍' }
        ],
        soup: [
            { id: 'russian', name: 'Русская', icon: '🇷🇺' },
            { id: 'french', name: 'Французская', icon: '🇫🇷' },
            { id: 'japanese', name: 'Японская', icon: '🇯🇵' }
        ],
        main: [
            { id: 'italian', name: 'Итальянская', icon: '🇮🇹' },
            { id: 'georgian', name: 'Грузинская', icon: '🇬🇪' },
            { id: 'thai', name: 'Тайская', icon: '🇹🇭' },
            { id: 'vietnamese', name: 'Вьетнамская', icon: '🇻🇳' }
        ],
        salad: [
            { id: 'russian', name: 'Русская', icon: '🇷🇺' },
            { id: 'spanish', name: 'Испанская', icon: '🇪🇸' }
        ],
        garnish: [
            { id: 'russian', name: 'Русская', icon: '🇷🇺' },
            { id: 'italian', name: 'Итальянская', icon: '🇮🇹' }
        ],
        dessert: [
            { id: 'french', name: 'Французская', icon: '🇫🇷' },
            { id: 'italian', name: 'Итальянская', icon: '🇮🇹' }
        ],
        drink: [
            { id: 'russian', name: 'Русская', icon: '🇷🇺' },
            { id: 'japanese', name: 'Японская', icon: '🇯🇵' }
        ]
    };
    
    const categories = categoriesConfig[mealType] || [];
    
    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">Категории не найдены</div>
                <div class="empty-state-subtext">Тип приема пищи: ${mealType}</div>
            </div>
        `;
        console.error(`Не найдены категории для типа: ${mealType}`);
        return;
    }
    
    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
        `;
        card.addEventListener('click', () => {
            currentSelection.category = cat.id;
            showSelectorStep('dish');
            renderDishes(mealType, cat.id);
            
            // Обновить заголовок
            const dishTitle = document.getElementById('dish-title');
            if (dishTitle) dishTitle.textContent = `Блюда: ${cat.name}`;
        });
        grid.appendChild(card);
    });
}

// Рендер списка блюд с улучшенной обработкой ошибок и мобильной поддержкой
function renderDishes(mealType, subcategory) {
    const list = document.getElementById('dishes-list');
    if (!list) {
        console.error('Элемент #dishes-list не найден');
        return;
    }
    
    list.innerHTML = '';
    
    const dishes = recipesDatabase[mealType]?.[subcategory] || [];
    
    if (dishes.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">Нет блюд в этой категории</div>
                <div class="empty-state-subtext">Попробуйте выбрать другую категорию</div>
            </div>
        `;
        return;
    }
    
    // Добавить индикатор прокрутки для мобильных
    const isMobile = window.innerWidth <= 768;
    if (isMobile && dishes.length > 3) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.textContent = '↑ Пролистайте для просмотра всех блюд ↓';
        list.appendChild(indicator);
    }
    
    dishes.forEach((dish, index) => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.setAttribute('data-index', index);
        card.innerHTML = `
            <div class="dish-icon">${getDishIcon(mealType)}</div>
            <div class="dish-info">
                <div class="dish-name">${dish.name}</div>
                <div class="dish-cuisine">${getFullCuisineName(dish.cuisine)}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            currentSelection.subcategory = subcategory;
            currentSelection.dishIndex = index;
            showSelectorStep('quantity');
            renderQuantityStep();
        });
        
        // Добавить визуальную обратную связь при нажатии на мобильных
        card.addEventListener('touchstart', () => {
            card.style.backgroundColor = '#e0e7ff';
        });
        card.addEventListener('touchend', () => {
            card.style.backgroundColor = '';
        });
        
        list.appendChild(card);
    });
    
    // Принудительно обновить скролл после рендера
    setTimeout(() => {
        list.scrollTop = 0;
        console.log(`Отрендерено ${dishes.length} блюд для ${mealType}/${subcategory}`);
    }, 10);
    
    if (window.innerWidth <= 768 && dishes.length > 2) {
        const hint = document.querySelector('.mobile-scroll-hint');
        if (hint) hint.style.display = 'block';
    }
}

// Получить иконку для типа блюда
function getDishIcon(mealType) {
    const icons = {
        breakfast: '🌅',
        soup: '🍲',
        main: '🍖',
        salad: '🥗',
        garnish: '🍚',
        dessert: '🍰',
        drink: '🥤'
    };
    return icons[mealType] || '🍽️';
}

// Полное название кухни
function getFullCuisineName(code) {
    const names = {
        'russian': 'Русская',
        'tatar': 'Татарская',
        'french': 'Французская',
        'italian': 'Итальянская',
        'spanish': 'Испанская',
        'japanese': 'Японская',
        'thai': 'Тайская',
        'vietnamese': 'Вьетнамская',
        'georgian': 'Грузинская',
        'european': 'Европейская'
    };
    return names[code] || code;
}

// Рендер шага выбора количества
function renderQuantityStep() {
    const portionQuantity = document.getElementById('portion-quantity');
    const dishPreview = document.getElementById('dish-preview');
    
    if (portionQuantity) {
        portionQuantity.value = currentSelection.quantity;
    }
    
    // Показать превью блюда
    const dish = recipesDatabase?.[currentSelection.mealType]?.[currentSelection.subcategory]?.[currentSelection.dishIndex];
    
    if (!dish || !dishPreview) return;
    
    let ingredientsHtml = '';
    if (dish.ingredients && Array.isArray(dish.ingredients)) {
        dish.ingredients.forEach(ing => {
            ingredientsHtml += `<div>• ${ing.name}: ${ing.quantity}</div>`;
        });
    }
    
    dishPreview.innerHTML = `
        <h3>${dish.name}</h3>
        <div class="cuisine-tag">${getFullCuisineName(dish.cuisine)}</div>
        <div class="ingredients-preview">
            <strong>Ингредиенты:</strong>
            ${ingredientsHtml}
        </div>
    `;
}

// Подтвердить выбор блюда
function confirmDishSelection() {
    if (currentSelection.dishIndex === null && currentSelection.dishIndex !== 0) {
        showNotification('Пожалуйста, выберите блюдо', 'error');
        return;
    }
    
    const day = currentSelection.day;
    const slotId = currentSelection.slotId;
    const mealType = currentSelection.mealType;
    const portionQuantity = document.getElementById('portion-quantity');
    const quantity = parseInt(portionQuantity?.value) || 1;
    
    // Инициализируем день, если его нет
    if (!currentMenu[day]) {
        currentMenu[day] = { slots: {} };
    }
    if (!currentMenu[day].slots) {
        currentMenu[day].slots = {};
    }
    
    const oldMeal = currentMenu[day].slots[slotId];
    const action = oldMeal ? 'изменено' : 'добавлено';
    
    // Сохраняем в уникальный слот
    currentMenu[day].slots[slotId] = {
        path: [mealType, currentSelection.subcategory, currentSelection.dishIndex],
        quantity: quantity
    };
    
    // Обновляем интерфейс
    renderDayMenu(day);
    updateShoppingList();
    saveToLocalStorage();
    
    // Закрываем модалку
    closeModalSelector();
    
    const recipe = findRecipeByPath(currentMenu[day].slots[slotId].path);
    if (recipe) {
        showNotification(`"${recipe.name}" ${action} (${quantity} порц${getPortionEnding(quantity)})`, 'success');
    }
}

// Закрыть модальное окно выбора
function closeModalSelector() {
    const modal = document.getElementById('meal-selector-modal');
    if (modal) modal.style.display = 'none';
    currentSelection = {};
}

// Инициализация обработчиков для селектора
function initSelectorEventListeners() {
    // Кнопки навигации
    const backToCategory = document.getElementById('back-to-category');
    if (backToCategory) {
        backToCategory.addEventListener('click', () => {
            showSelectorStep('category');
        });
    }
    
    const backToSubcategory = document.getElementById('back-to-subcategory');
    if (backToSubcategory) {
        backToSubcategory.addEventListener('click', () => {
            showSelectorStep('category');
            renderCategories(currentSelection.mealType);
        });
    }
    
    const backToDish = document.getElementById('back-to-dish');
    if (backToDish) {
        backToDish.addEventListener('click', () => {
            showSelectorStep('dish');
            renderDishes(currentSelection.mealType, currentSelection.subcategory);
        });
    }
    
    // Кнопки количества
    const increaseQty = document.getElementById('increase-qty');
    if (increaseQty) {
        increaseQty.addEventListener('click', () => {
            const portionQuantity = document.getElementById('portion-quantity');
            if (!portionQuantity) return;
            
            let qty = parseInt(portionQuantity.value) || 1;
            portionQuantity.value = qty + 1;
            currentSelection.quantity = qty + 1;
        });
    }
    
    const decreaseQty = document.getElementById('decrease-qty');
    if (decreaseQty) {
        decreaseQty.addEventListener('click', () => {
            const portionQuantity = document.getElementById('portion-quantity');
            if (!portionQuantity) return;
            
            let qty = parseInt(portionQuantity.value) || 1;
            if (qty > 1) {
                portionQuantity.value = qty - 1;
                currentSelection.quantity = qty - 1;
            }
        });
    }
    
    const portionQuantity = document.getElementById('portion-quantity');
    if (portionQuantity) {
        portionQuantity.addEventListener('change', (e) => {
            let qty = parseInt(e.target.value) || 1;
            if (qty < 1) qty = 1;
            currentSelection.quantity = qty;
            e.target.value = qty;
        });
    }
    
    // Подтверждение выбора
    const confirmSelection = document.getElementById('confirm-selection');
    if (confirmSelection) {
        confirmSelection.addEventListener('click', confirmDishSelection);
    }
    
    // Кнопка "Удалить выбор"
    const clearSelection = document.getElementById('clear-selection');
    if (clearSelection) {
        clearSelection.addEventListener('click', () => {
            if (currentSelection.day && currentSelection.slotId) {
                deleteMeal(currentSelection.day, currentSelection.slotId);
                closeModalSelector();
            }
        });
    }
    
    // Закрытие модалки
    const selectorClose = document.querySelector('.selector-close');
    if (selectorClose) {
        selectorClose.addEventListener('click', closeModalSelector);
    }
    
    // Закрытие по клику вне модалки
    const mealSelectorModal = document.getElementById('meal-selector-modal');
    if (mealSelectorModal) {
        mealSelectorModal.addEventListener('click', (e) => {
            if (e.target === mealSelectorModal) {
                closeModalSelector();
            }
        });
    }
}

// ========== УВЕДОМЛЕНИЯ ==========

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.warn('Контейнер уведомлений не найден');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Закрытие по кнопке
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    // Автоматическое закрытие
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    return icons[type] || 'ℹ️';
}

// ========== ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ ==========

// Сделать функции доступными из HTML
window.openMealSelector = openMealSelector;
window.openRecipeModal = openRecipeModal;
window.toggleIngredient = toggleIngredient;
window.closeModal = closeModal;
window.closeModalSelector = closeModalSelector;
window.confirmDishSelection = confirmDishSelection;
window.editMeal = editMeal;
window.changeQuantity = changeQuantity;
window.deleteMeal = deleteMeal;
window.closeQuantityModal = closeQuantityModal;
window.applyCustomQuantity = applyCustomQuantity;
