(() => {
window.Buildings={
road:{name:'Дорога',icon:'🪨',desc:'Связывает здания с поселением',cost:{wood:1},kind:'road'},
house:{name:'Дом поселенца',icon:'🏠',desc:'Место для 4 жителей',cost:{wood:8,stone:2},housing:4},
manor:{name:'Усадьба',icon:'🏡',desc:'Место для 8 жителей',cost:{wood:15,stone:8,gold:5},housing:8},
farm:{name:'Ферма',icon:'🌾',desc:'Производит зерно',cost:{wood:10,stone:2},jobs:2,jobTitle:'Фермер',production:{grain:6}},
mill:{name:'Мельница',icon:'⚙️',desc:'Перемалывает зерно в муку',cost:{wood:14,stone:5},jobs:2,jobTitle:'Мельник',recipe:{input:{grain:4},output:{flour:3}}},
bakery:{name:'Пекарня',icon:'🍞',desc:'Печёт хлеб из муки',cost:{wood:12,stone:5},jobs:2,jobTitle:'Пекарь',recipe:{input:{flour:3},output:{food:6}}},
lumber:{name:'Лесопилка',icon:'🪵',desc:'Добывает древесину',cost:{wood:8,stone:3},jobs:2,jobTitle:'Лесоруб',production:{wood:5}},
quarry:{name:'Каменоломня',icon:'⛏️',desc:'Добывает камень',cost:{wood:9},jobs:2,jobTitle:'Каменотёс',production:{stone:3}},
market:{name:'Рынок',icon:'🏪',desc:'Повышает благополучие',cost:{wood:18,stone:10},jobs:2,jobTitle:'Торговец',happiness:5},
well:{name:'Колодец',icon:'🪣',desc:'Чистая вода для жителей',cost:{wood:5,stone:8},happiness:3},
tavern:{name:'Таверна',icon:'🍺',desc:'Место встреч и отдыха',cost:{wood:20,stone:8},jobs:2,jobTitle:'Трактирщик',happiness:7},
chapel:{name:'Часовня',icon:'⛪',desc:'Укрепляет дух общины',cost:{wood:12,stone:15,gold:8},happiness:8},
townhall:{name:'Ратуша',icon:'🏛️',desc:'Сердце управления городом',cost:{wood:25,stone:20,gold:15},jobs:2,jobTitle:'Служащий',minTier:'village'},
wall:{name:'Крепостная стена',icon:'🧱',desc:'Защищает городские кварталы',cost:{wood:2,stone:3},minTier:'village'},
gate:{name:'Городские ворота',icon:'🚪',desc:'Проход сквозь крепостную стену',cost:{wood:8,stone:10},minTier:'village'},
watchtower:{name:'Сторожевая башня',icon:'🗼',desc:'Дозор над окрестностями',cost:{wood:12,stone:14},jobs:2,jobTitle:'Стражник',minTier:'village'},
keep:{name:'Каменный замок',icon:'🏰',desc:'Символ власти и центр королевства',cost:{wood:40,stone:50,gold:35},jobs:4,jobTitle:'Стражник',minTier:'town'}
};
})();