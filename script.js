// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    generateMenu();
    userRecipes = JSON.parse(localStorage.getItem('customRecipes')) || {};
    allDishesDB = getAllDishes();
    
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
});

// Генерация меню на 31 день
function generateMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = '';
    const weekdayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    
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
                    <select class="meal-select" data-day="${day}" data-period="breakfast" onchange="updateShoppingList()">
                        <option value="">Выберите блюдо...</option>
                        ${generateOptions('Завтраки')}
                    </select>
                    <span class="recipe-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="showRecipeForDay(${day}, 'breakfast')">📖</span>
                </div>
            </div>
            <!-- ... остальные периоды дня (обед, ужин) -->
        `;
        menuGrid.appendChild(dayCard);
    }
    
    setTimeout(() => {
        restoreSelectedDishes();
    }, 100);
}

// ... остальные функции (сокращено для примера)
// - generateOptions()
// - showRecipeForDay()
// - showRecipe()
// - closeRecipeModal()
// - generateRandomMenu()
// - saveMenu()
// - resetMenu()
// - updateShoppingList()
// - updateIngredientsList()
// - updateShoppingCart()
// - toggleIngredient()
// - downloadShoppingList()
// - clearShoppingList()
// - switchToMenu()
// - viewShoppingList()
// - switchToShopping()
// - getPeriodName()
// - restoreSelectedDishes()
// - openAddRecipeModal()
// - closeAddRecipeModal()
// - updateSubcategories()
// - addIngredientField()
// - addStepField()
// - saveCustomRecipe()

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
};