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
                <div class="meal-title">🍳 Завтрак</div>
                <div style="position: relative;">
                    <select class="meal-select" data-day="${day}" data-period="breakfast" onchange="app.updateShoppingList()">
                        <option value="">Выберите блюдо...</option>
                        ${generateOptions('Завтраки')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'breakfast')">📖</span>
                </div>
            </div>
            <div class="meal-period lunch">
                <div class="meal-title">🍲 Обед</div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch" onchange="app.updateShoppingList()">
                        <option value="">Выберите первое блюдо...</option>
                        ${generateOptions('Первые блюда')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'lunch')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch-main" onchange="app.updateShoppingList()">
                        <option value="">Выберите второе блюдо...</option>
                        ${generateOptions('Вторые блюда')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'lunch-main')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="lunch-salad" onchange="app.updateShoppingList()">
                        <option value="">Выберите салат...</option>
                        ${generateOptions('Салаты')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'lunch-salad')">📖</span>
                </div>
            </div>
            <div class="meal-period dinner">
                <div class="meal-title">🍽️ Ужин</div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner" onchange="app.updateShoppingList()">
                        <option value="">Выберите основное блюдо...</option>
                        ${generateOptions('Ужин основное')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'dinner')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner-garnish" onchange="app.updateShoppingList()">
                        <option value="">Выберите гарнир...</option>
                        ${generateOptions('Ужин гарниры')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'dinner-garnish')">📖</span>
                </div>
                <div style="position: relative; margin-bottom: 8px;">
                    <select class="meal-select" data-day="${day}" data-period="dinner-dessert" onchange="app.updateShoppingList()">
                        <option value="">Выберите десерт...</option>
                        ${generateOptions('Ужин десерты')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="ui.showRecipeForDay(${day}, 'dinner-dessert')">📖</span>
                </div>
            </div>
        `;
        
        menuGrid.appendChild(dayCard);
    }
    
    // Восстанавливаем сохранённые выборы
    setTimeout(() => {
        app.restoreSelectedDishes();
    }, 100);
}

// Генерация опций для select
function generateOptions(category) {
    let options = '';
    
    // Стандартные блюда
    if (database.dishes[category]) {
        for (const [subcategory, items] of Object.entries(database.dishes[category])) {
            options += `<optgroup label="${subcategory}">`;
            items.forEach(item => {
                const dishName = typeof item === 'string' ? item : item.name;
                options += `<option value="${dishName}">${dishName}</option>`;
            });
            options += `</optgroup>`;
        }
    }
    
    // Пользовательские рецепты
    if (database.userRecipes[category]) {
        for (const [subcategory, items] of Object.entries(database.userRecipes[category])) {
            options += `<optgroup label="${subcategory} (мои)">`;
            items.forEach(item => {
                options += `<option value="${item.name}">${item.name} ★</option>`;
            });
            options += `</optgroup>`;
        }
    }
    
    return options;
}

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

// Показать рецепт в модальном окне
function showRecipe(dishName) {
    const dish = database.getAllDishes()[dishName];
    if (!dish) {
        alert('Рецепт не найден!');
        return;
    }
    
    const recipeContent = document.getElementById('recipeContent');
    if (!recipeContent) return;
    
    let ingredientsHTML = '';
    dish.ingredients.forEach(ing => {
        ingredientsHTML += `<div class="ingredient-grid"><span class="qty">${ing.qty}</span><span class="name">${ing.name}</span></div>`;
    });
    
    let stepsHTML = '';
    dish.steps.forEach((step, index) => {
        stepsHTML += `<li>${step}</li>`;
    });
    
    let tipsHTML = '';
    if (dish.tips && dish.tips.length > 0) {
        dish.tips.forEach(tip => {
            tipsHTML += `<p>💡 ${tip}</p>`;
        });
    }
    
    recipeContent.innerHTML = `
        <div class="recipe-header">
            <h2>${dish.name}</h2>
            <div class="cuisine-tag">${dish.cuisine || 'Домашняя'} кухня</div>
        </div>
        <div class="recipe-grid">
            <div class="recipe-section">
                <h3>📋 Ингредиенты</h3>
                ${ingredientsHTML}
            </div>
            <div class="recipe-section">
                <h3>👩‍🍳 Пошаговый рецепт</h3>
                <div class="steps">
                    <ol>${stepsHTML}</ol>
                </div>
            </div>
        </div>
        ${tipsHTML ? `
            <div class="recipe-tips">
                <h3>💡 Советы шеф-повара</h3>
                ${tipsHTML}
            </div>
        ` : ''}
    `;
    
    document.getElementById('recipeModal').classList.add('active');
}

// Закрыть модальное окно рецепта
function closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Обновление списка ингредиентов по блюдам
function updateIngredientsList() {
    const ingredientsList = document.getElementById('ingredientsList');
    if (!ingredientsList) return;
    
    if (Object.keys(app.selectedDishes).length === 0) {
        ingredientsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Выберите блюда в меню, чтобы увидеть ингредиенты</div>';
        return;
    }
    
    let html = '';
    
    for (const [day, periods] of Object.entries(app.selectedDishes)) {
        html += `<div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
            <strong>📅 День ${day}</strong>
            <div style="margin-top: 10px;">`;
        
        for (const [period, dishName] of Object.entries(periods)) {
            const dish = database.getAllDishes()[dishName];
            if (dish) {
                const periodName = utils.getPeriodName(period);
                html += `
                    <div style="margin-bottom: 15px;">
                        <strong>${periodName}: ${dishName}</strong>
                        <div style="margin-top: 8px; padding-left: 15px;">`;
                
                dish.ingredients.forEach(ing => {
                    html += `<div>• ${ing.qty} ${ing.name}</div>`;
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
    
    if (Object.keys(app.selectedDishes).length === 0) {
        shoppingList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Выберите блюда, чтобы сформировать список покупок</div>';
        return;
    }
    
    // Собираем все ингредиенты
    const allIngredients = {};
    for (const periods of Object.values(app.selectedDishes)) {
        for (const dishName of Object.values(periods)) {
            const dish = database.getAllDishes()[dishName];
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
    
    // Сортируем ингредиенты по категориям
    const categories = utils.getIngredientCategories();
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
                <strong style="color: #667eea; font-size: 1.2em;">${category}</strong>
                <div style="margin-top: 10px;">`;
            
            for (const [name, data] of Object.entries(categoryIngredients).sort()) {
                html += `
                    <div class="ingredient-item" data-name="${name}">
                        <span>${name} — ${data.qty}${data.count > 1 ? ` (используется ${data.count} раз)` : ''}</span>
                        <input type="checkbox" class="checkbox" onclick="ui.toggleIngredient(this)">
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
            <strong style="color: #667eea; font-size: 1.2em;">Прочее</strong>
            <div style="margin-top: 10px;">`;
        
        for (const [name, data] of Object.entries(otherIngredients).sort()) {
            html += `
                <div class="ingredient-item" data-name="${name}">
                    <span>${name} — ${data.qty}${data.count > 1 ? ` (используется ${data.count} раз)` : ''}</span>
                    <input type="checkbox" class="checkbox" onclick="ui.toggleIngredient(this)">
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

// Модальные окна добавления рецепта
function openAddRecipeModal() {
    document.getElementById('addRecipeModal').classList.add('active');
    
    // Очистить форму
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeCategory').value = '';
    document.getElementById('recipeSubcategory').innerHTML = '<option value="">Сначала выберите тип блюда...</option>';
    document.getElementById('recipeCuisine').value = '';
    document.getElementById('recipeTips').value = '';
    
    document.getElementById('ingredientsContainer').innerHTML = `
        <div class="ingredient-row" style="display: flex; gap: 10px; margin-bottom: 8px;">
            <input type="text" placeholder="Количество" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <input type="text" placeholder="Название ингредиента" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
    `;
    
    document.getElementById('stepsContainer').innerHTML = `
        <textarea class="recipe-input" placeholder="Шаг 1: Описание действия..." rows="3" style="margin-bottom: 8px;"></textarea>
    `;
}

function closeAddRecipeModal() {
    document.getElementById('addRecipeModal').classList.remove('active');
}

// Обновить подкатегории в зависимости от типа блюда
function updateSubcategories() {
    const category = document.getElementById('recipeCategory').value;
    const subcategorySelect = document.getElementById('recipeSubcategory');
    
    // Очистить текущие опции
    subcategorySelect.innerHTML = '';
    subcategorySelect.innerHTML = '<option value="">Выберите подкатегорию...</option>';
    
    if (!category) return;
    
    // Определить подкатегории для каждого типа блюда
    const subcategories = {
        "Завтраки": ["Каши", "Яичные блюда", "Выпечка", "Татарские завтраки"],
        "Первые блюда": ["Русские супы", "Татарские супы", "Европейские супы", "Азиатские супы"],
        "Вторые блюда": ["Русские мясные", "Татарские мясные", "Европейские мясные", "Рыбные блюда", "Паста и рис"],
        "Салаты": ["Русские салаты", "Европейские салаты", "Татарские закуски"],
        "Ужин основное": ["Рыбные", "Мясные"],
        "Ужин гарниры": ["Крупы", "Картофель", "Овощи"],
        "Ужин десерты": ["Десерты", "Напитки"]
    };
    
    if (subcategories[category]) {
        subcategories[category].forEach(subcat => {
            const option = document.createElement('option');
            option.value = subcat;
            option.textContent = subcat;
            subcategorySelect.appendChild(option);
        });
    }
}

// Добавить поле для ингредиента
function addIngredientField() {
    const container = document.getElementById('ingredientsContainer');
    const div = document.createElement('div');
    div.className = 'ingredient-row';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '8px';
    div.innerHTML = `
        <input type="text" placeholder="Количество" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <input type="text" placeholder="Название ингредиента" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" style="background: #dc3545; color: white; border: none; width: 30px; border-radius: 4px; cursor: pointer;" onclick="this.parentElement.remove()">-</button>
    `;
    container.appendChild(div);
}

// Добавить поле для шага
function addStepField() {
    const container = document.getElementById('stepsContainer');
    const textarea = document.createElement('textarea');
    textarea.className = 'recipe-input';
    textarea.placeholder = `Шаг ${container.children.length + 1}: Описание действия...`;
    textarea.rows = 3;
    textarea.style.marginBottom = '8px';
    textarea.style.width = '100%';
    textarea.style.padding = '10px';
    textarea.style.border = '2px solid #ddd';
    textarea.style.borderRadius = '6px';
    textarea.style.fontSize = '1em';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = 'Удалить шаг';
    removeBtn.style.background = '#dc3545';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '4px';
    removeBtn.style.padding = '5px 10px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.marginTop = '5px';
    removeBtn.onclick = () => textarea.parentElement.remove();
    
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '15px';
    wrapper.appendChild(textarea);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
}

// Экспорт модуля
const ui = {
    generateMenu,
    generateOptions,
    showRecipeForDay,
    showRecipe,
    closeRecipeModal,
    updateIngredientsList,
    updateShoppingCart,
    toggleIngredient,
    openAddRecipeModal,
    closeAddRecipeModal,
    updateSubcategories,
    addIngredientField,
    addStepField
};