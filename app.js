// Получить категорию по периоду (перемещено вверх для хоистинга)
function getCategoryByPeriod(period) {
    const mapping = {
        'breakfast': 'Завтраки',
        'lunch': 'Первые блюда',
        'lunch-main': 'Вторые блюда',
        'lunch-salad': 'Салаты',
        'dinner': 'Ужин основное',
        'dinner-garnish': 'Ужин гарниры',
        'dinner-dessert': 'Ужин десерты'
    };
    return mapping[period] || '';
}

// Выбранные блюда
let selectedDishes = {};

// Инициализация приложения
function init() {
    ui.generateMenu();
    database.userRecipes = JSON.parse(localStorage.getItem('customRecipes')) || {};
}

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
    
    const dataStr = JSON.stringify(menuData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `menu_31_days_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Меню успешно сохранено!');
}

// Сброс меню
function resetMenu() {
    if (confirm('Сбросить всё меню? Все выбранные блюда будут удалены.')) {
        const selects = document.querySelectorAll('.meal-select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
        selectedDishes = {};
        updateShoppingList();
        alert('Меню сброшено!');
    }
}

// Переключение вкладок
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
}

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
    
    // Обновляем списки
    ui.updateIngredientsList();
    ui.updateShoppingCart();
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

// Скачать список покупок
function downloadShoppingList() {
    const items = document.querySelectorAll('#shoppingList .ingredient-item');
    if (items.length === 0) {
        alert('Список покупок пуст!');
        return;
    }
    
    let text = 'СПИСОК ПОКУПОК\n';
    text += `Дата: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
    
    items.forEach(item => {
        const name = item.dataset.name;
        const qty = item.querySelector('span').textContent.split(' — ')[1];
        const bought = item.classList.contains('checked') ? ' ✓ КУПЛЕНО' : '';
        text += `□ ${name} — ${qty}${bought}\n`;
    });
    
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping_list_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Очистить список покупок
function clearShoppingList() {
    if (confirm('Очистить весь список покупок? Это также сбросит все выбранные блюда в меню.')) {
        resetMenu();
    }
}

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

// Сохранить пользовательский рецепт
function saveCustomRecipe() {
    // Получить данные из формы
    const name = document.getElementById('recipeName').value.trim();
    const category = document.getElementById('recipeCategory').value;
    const subcategory = document.getElementById('recipeSubcategory').value;
    const cuisine = document.getElementById('recipeCuisine').value.trim() || 'Домашняя';
    
    // Валидация
    if (!name || !category || !subcategory) {
        alert('Заполните обязательные поля: название, тип блюда и подкатегорию!');
        return;
    }
    
    // Собрать ингредиенты
    const ingredientRows = document.querySelectorAll('#ingredientsContainer .ingredient-row');
    const ingredients = [];
    let hasValidIngredient = false;
    
    ingredientRows.forEach(row => {
        const qtyInput = row.querySelector('input:first-child');
        const nameInput = row.querySelector('input:last-child');
        const qty = qtyInput.value.trim();
        const ingName = nameInput.value.trim();
        
        if (qty && ingName) {
            ingredients.push({name: ingName, qty: qty});
            hasValidIngredient = true;
        }
    });
    
    if (!hasValidIngredient) {
        alert('Добавьте хотя бы один ингредиент!');
        return;
    }
    
    // Собрать шаги
    const stepTextareas = document.querySelectorAll('#stepsContainer textarea');
    const steps = [];
    let hasValidStep = false;
    
    stepTextareas.forEach(textarea => {
        const step = textarea.value.trim();
        if (step) {
            steps.push(step);
            hasValidStep = true;
        }
    });
    
    if (!hasValidStep) {
        alert('Добавьте хотя бы один шаг приготовления!');
        return;
    }
    
    // Собрать советы
    const tips = document.getElementById('recipeTips').value.trim();
    const tipsArray = tips ? [tips] : [];
    
    // Создать объект рецепта
    const recipe = {
        name: name,
        cuisine: cuisine,
        ingredients: ingredients,
        steps: steps,
        tips: tipsArray
    };
    
    // Сохранить в хранилище
    if (!database.userRecipes[category]) database.userRecipes[category] = {};
    if (!database.userRecipes[category][subcategory]) database.userRecipes[category][subcategory] = [];
    
    database.userRecipes[category][subcategory].push(recipe);
    database.updateUserRecipes(database.userRecipes);
    
    // Закрыть модальное окно
    ui.closeAddRecipeModal();
    
 // Получить категорию по периоду
function getCategoryByPeriod(period) {
    const mapping = {
        'breakfast': 'Завтраки',
        'lunch': 'Первые блюда',
        'lunch-main': 'Вторые блюда',
        'lunch-salad': 'Салаты',
        'dinner': 'Ужин основное',
        'dinner-garnish': 'Ужин гарниры',
        'dinner-dessert': 'Ужин десерты'
    };
    return mapping[period] || '';
}

// Закрытие модальных окон по клику вне их
function initModalClose() {
    window.onclick = function(event) {
        const recipeModal = document.getElementById('recipeModal');
        const addRecipeModal = document.getElementById('addRecipeModal');
        
        if (recipeModal && event.target === recipeModal) {
            ui.closeRecipeModal();
        }
        
        if (addRecipeModal && event.target === addRecipeModal) {
            ui.closeAddRecipeModal();
        }
    };
}

// Экспорт модуля
const app = 
{
    selectedDishes,
    init,
    generateRandomMenu,
    saveMenu,
    resetMenu,
    initTabs,
    updateShoppingList,
    restoreSelectedDishes,
    downloadShoppingList,
    clearShoppingList,
    switchToMenu,
    viewShoppingList,
    switchToShopping,
    saveCustomRecipe,
    regenerateMenuOptions,
    initModalClose,
};
}
