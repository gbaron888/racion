// База данных блюд с рецептами и ингредиентами
const dishes = {
    "Завтраки": {
        "Каши": [
            {
                name: "Гречневая каша",
                cuisine: "Русская",
                ingredients: [
                    {name: "Гречневая крупа", qty: "1 стакан"},
                    {name: "Вода", qty: "2 стакана"},
                    {name: "Соль", qty: "1/2 ч.л."},
                    {name: "Сливочное масло", qty: "20 г"}
                ],
                steps: [
                    "Промойте гречку под холодной водой.",
                    "Залейте водой в соотношении 1:2.",
                    "Добавьте соль и доведите до кипения.",
                    "Уменьшите огонь, накройте крышкой и варите 15-20 минут.",
                    "Снимите с огня, добавьте масло, укутайте и дайте настояться 10 минут."
                ],
                tips: ["Для рассыпчатой каши используйте соотношение 1:1.5", "Можно варить на молоке для более нежного вкуса"]
            },
            // ... остальные рецепты каши (сокращено для примера)
        ],
        // ... остальные подкатегории завтраков
    },
    "Первые блюда": {
        // ... рецепты супов
    },
    "Вторые блюда": {
        // ... рецепты вторых блюд
    },
    "Салаты": {
        // ... рецепты салатов
    },
    "Ужин основное": {
        // ... рецепты основных блюд на ужин
    },
    "Ужин гарниры": {
        // ... рецепты гарниров
    },
    "Ужин десерты": {
        // ... рецепты десертов и напитков
    }
};

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