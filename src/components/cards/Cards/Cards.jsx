import Card from "../card/Card/Card";
import { useEffect, useRef, useState } from "react";

// Объявление переменных
export let cArray = [];
export let hArray = [];

export let fantomHolder = null;
export let pRect = null;

export let delayScale = 0;
export let delayPosition = 0;
export let delayRotation = 0;
export let delayHighlight = 0;

// Назначение величины отступа
function setOffset(index) {
    const fieldWidth = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--width-main')) / 100 * window.innerWidth;
    const fieldMaxWidth = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--width-main-max'));
    const initialOffset = () => Math.min(fieldWidth() * 0.09, fieldMaxWidth() * 0.09) * (7 / 5) * 0.25;
    return initialOffset() * index;
};

// Изменение отступов стопок "запасных" карт
function changeOffsetX(stash, stashes) {
    if (stash.length === 0) return;

    stash.forEach(c => {
        c.style.left = `${pRect.left - setOffset(stashes - parseFloat(c.dataset.stash)) / 2}px`;
    });
};

// Изменение отступов карточной стопки
export function changeOffsetY(stack) {
    if (stack.length === 0) return;

    const offsetStart = 5;
    const top = parseFloat(stack[0].style.top);

    // Сужение отступов при достижении предельного размера стопки
    if (stack.length > offsetStart) {
        stack.forEach((c, index) => {
            c.style.top = `${top + setOffset(index) * Math.pow(0.975, stack.length)}px`;
        });
    }

    // Назначение стандартной величины отступов
    else {
        stack.forEach((c, index) => {
            c.style.top = `${top + setOffset(index)}px`;
        });
    };
};

// Поиск всех карт-потомков
export function getCardsOnTop(card) {
    const result = [];
    let currentId = card.dataset.hasOnTop;

    while (currentId) {
        const card = cArray.find(c => c.dataset.id === currentId);
        if (card) {
            result.push(card);
            currentId = card.dataset.hasOnTop;
        } else {
            currentId = null;
        };
    };

    return result;
};

// Поиск родительского держателя карты
export function getParentHolder(cardOrHolder) {
    // Параметр является держателем
    if (hArray.includes(cardOrHolder)) return cardOrHolder;

    // Параметр является картой
    let parentID = cardOrHolder.dataset.placedOn;
    while (cArray.find(c => c.dataset.id === parentID)) {
        parentID = cArray.find(c => c.dataset.id === parentID).dataset.placedOn;
    };
    return hArray.find(h => h.dataset.id === parentID);
};

// Поиск расположенной карточной стопки
export function getFullStack(holder) {
    return getCardsOnTop(holder);
};

// Поиск перемещаемой карточной стопки
export function getCurrentStack(card) {
    let container = [card];
    getCardsOnTop(card).forEach(c => container.push(c));
    return container;
};

// Поиск карты под текущей
export function findCardUnder(card, cardsOnTop, prevParent) {
    // Поиск центра текущей карты
    const cardRect = card.getBoundingClientRect();
    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;

    // Поиск карты, содержащей центр текущей
    for (let i = cArray.length - 1; i >= 0; i--) {
        const c = cArray[i];
        if (cardsOnTop.includes(c) || c === card || c.dataset.hasOnTop || c === prevParent) continue;
        const cRect = c.getBoundingClientRect();
        if (
            centerX >= cRect.left &&
            centerX <= cRect.right &&
            centerY >= cRect.top &&
            centerY <= cRect.bottom
        ) return c;
    };

    // Поиск держателя карты, содержащего центр текущей
    for (let i = hArray.length - 1; i >= 0; i--) {
        const h = hArray[i];
        if (h.dataset.hasOnTop || h === prevParent) continue;
        const hRect = h.getBoundingClientRect();
        if (
            centerX >= hRect.left &&
            centerX <= hRect.right &&
            centerY >= hRect.top &&
            centerY <= hRect.bottom
        ) return h;
    };

    return null;
};

// Возврат карт на начальные координаты
export function returnToInitialPosition(card, cardsOnTop, prevParent) {
    const initialLeft = parseFloat(card.dataset.initialLeft);
    const initialTop = parseFloat(card.dataset.initialTop);

    // Восстановление связей родитель/потомок
    card.dataset.placedOn = prevParent.dataset.id;
    prevParent.dataset.hasOnTop = card.dataset.id;
    fantomHolder.dataset.hasOnTop = "";

    // Возврат текущей карты
    card.style.left = `${initialLeft}px`;
    card.style.top = `${initialTop}px`;

    // Возврат карт-потомков
    cardsOnTop.forEach((c) => {
        c.style.left = `${initialLeft}px`;
        c.style.top = `${initialTop}px`;
    });

    // Назначение отступов
    changeOffsetY(getFullStack(getParentHolder(card)));
};

// Переворачивание карты
export function flipCard(card) {
    if (card.dataset.flipped === "true") {
        card.classList.add(`card_flipped`);
        card.dataset.flipped = "false";
    } else {
        card.classList.remove(`card_flipped`);
        card.dataset.flipped = "true";
    };
};

// Событие изменения размера экрана
function onResize() {
    // Для разложенных карт
    hArray.forEach(h => {
        const hStack = getFullStack(h);
        const hRect = h.getBoundingClientRect();

        // Размещение карт
        hStack.forEach(c => {
            c.style.left = `${hRect.left}px`;
            c.style.top = `${hRect.top}px`;
        });

        // Назначение отступов
        changeOffsetY(hStack);

        // Обновление начальных координат
        hStack.forEach(c => {
            c.dataset.initialLeft = parseFloat(c.style.left);
            c.dataset.initialTop = parseFloat(c.style.top);
        });
    });

    // Для "запасных" карт
    pRect = document.getElementsByClassName("main__score_right")[0].getBoundingClientRect();
    const stash = cArray.filter(c => parseFloat(c.dataset.stash) >= currentStash);
    stash.forEach(c => {
        c.style.left = `${pRect.left}px`;
        c.style.top = `${pRect.top}px`;
    });
    changeOffsetX(stash, stashes);
};

// Переменные и функции для старта игры
const setDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let stashes = 0;
let currentStash = "1";

// Поведение карт при рендеринге страницы
async function start(numCards, numHolders) {
    // Определение количества "запасных" карт и их стопок
    stashes = Math.floor(numCards / numHolders / 2);
    const stashed = stashes * numHolders;

    // Назначение параметра очерёдности раскладывания карт
    for (let i = 0; i < numCards; i++) {
        const card = cArray[i];
        card.style.zIndex = 2 * (numCards - numHolders) - i + 1; // z-index неразложенных карт назначается с хитро-высчитанным запасом, чтобы избежать наложения карт
        card.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow 0s, background-color 0s, transform ${delayRotation}, z-index 0s ${delayPosition}`;

        if (i < numCards - stashed) {
            card.dataset.stash = `0`;
        } else {
            for (let j = 1; j <= stashes; j++) {
                if (i < numCards - stashed + numHolders * j) {
                    card.dataset.stash = `${j}`;
                    break;
                };
            };
        };
    };

    // Асинхронное раскладывание стартовых карт на игровое поле
    await cardsUnfold(cArray.filter(c => c.dataset.stash === "0"), numHolders);

    // Назначение слушателей клика ЛКМ на неразложенные карты, придание им стилей
    if (stashes > 0) {
        await setDelay(250);
        for (let i = 1; i <= stashes; i++) {
            const stash = cArray.filter(c => c.dataset.stash === `${i}`);
            const firstInStash = stash[0];
            firstInStash.addEventListener('click', (e) => stashUnfold(firstInStash, stash, numHolders));

            if (firstInStash.dataset.stash === currentStash) firstInStash.style.cursor = "pointer";
            changeOffsetX(stash, stashes);
        };
    };
};

// Раскладывание "запасных" карт
function stashUnfold(firstInStash, stash, numHolders) {
    if (firstInStash.dataset.stash === currentStash) {
        cardsUnfold(stash, numHolders);
        firstInStash.removeEventListener('click', stashUnfold);
        firstInStash.style.cursor = "grab";
        currentStash = `${parseFloat(currentStash) + 1}`;
        const newFirstInStash = cArray.find(c => c.dataset.stash === currentStash);
        if (newFirstInStash !== undefined) newFirstInStash.style.cursor = "pointer";
    };
};

// Раскладывание карт
async function cardsUnfold(stack, numHolders) {
    // Определение количества перевёрнутых карт
    const numFlipped = (stack.length - numHolders) < 0 ? 0 : stack.length - numHolders;

    for (let i = 0; i < stack.length; i++) {
        await setDelay(30);
        const card = stack[i];
        let parent = null;

        // Назначение родительской карты в зависимости от очерёдности раскладывания
        if (card.dataset.stash === "0") {
            if (i < numHolders) {
                parent = hArray[i];
            } else {
                parent = cArray[i - numHolders];
            };
        } else {
            parent = (hArray[i].dataset.hasOnTop === "") ? hArray[i] : getCardsOnTop(hArray[i]).find(c => c.dataset.hasOnTop === "");
        };

        // Назначение связей родитель/потомок
        card.dataset.placedOn = parent.dataset.id;
        parent.dataset.hasOnTop = card.dataset.id;

        card.style.zIndex = `${parseInt(parent.style.zIndex) + 1}`;

        // Размещение карты с отступами, обновление начальных координат
        const holder = getParentHolder(card);
        const hRect = holder.getBoundingClientRect();

        card.style.left = `${hRect.left}px`;
        card.style.top = `${hRect.top}px`;

        changeOffsetY(getFullStack(holder));

        card.dataset.initialLeft = parseFloat(card.style.left);
        card.dataset.initialTop = parseFloat(card.style.top);

        // Переворачивание карты
        if (i >= numFlipped) flipCard(card);
    };
};

function Cards(props) {
    hArray = Array.from(document.getElementsByClassName(`holders`)[0].childNodes);
    fantomHolder = hArray.at(-1);

    delayScale = getComputedStyle(document.documentElement).getPropertyValue('--delay-card-scale');
    delayPosition = getComputedStyle(document.documentElement).getPropertyValue('--delay-card-position');
    delayRotation = getComputedStyle(document.documentElement).getPropertyValue('--delay-card-rotation');
    delayHighlight = getComputedStyle(document.documentElement).getPropertyValue('--delay-card-highlight');

    const container = [];
    const cardsRef = useRef(null);

    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["heart", "spade", "diamond", "club"];
    pRect = document.getElementsByClassName("main__score_right")[0].getBoundingClientRect();
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    };

    for (let i = 0; i < props.numCards; i++) {
        const currentRank = ranks[getRandomInt(ranks.length)];
        const currentSuit = suits[getRandomInt(suits.length)];
        container.push(<Card key={i} rank={currentRank} suit={currentSuit} id={`c${i}`} />);
    };

    useEffect(() => {
        if (cardsRef.current) {
            window.addEventListener("resize", (e) => onResize());
            start(props.numCards, props.numHolders - 1);
        };
    }, []);

    return (
        <div className="cards" ref={cardsRef}>
            {container}
        </div>
    );
};

export default Cards;