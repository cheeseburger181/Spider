import Suit from "../Suit/Suit";
import Template from "../Template/Template";
import './Card.css';
import { useEffect, useRef } from "react";
import { cardsArray, holdersArray } from "../../../../App";

function Card(props) {
    // Объявление параметров стилей
    const initialOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--width-card')) * 7 / 5 * 0.25;
    const delay = getComputedStyle(document.documentElement).getPropertyValue('--delay-card');

    // Добавление стартовых параметров карты
    const cardRef = useRef(null);
    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.dataset.id = props.id;
            cardRef.current.dataset.initialLeft = props.left;
            cardRef.current.dataset.initialTop = props.top;
            cardRef.current.dataset.placedOn = "";
            cardRef.current.dataset.hasOnTop = "";
            cardRef.current.style = `left: ${props.left}px; top: ${props.top}px; z-index: 1`;

            // Сомнительна часть, которую придётся заменить
            const i = cardsArray.length;
            holdersArray[i].dataset.hasOnTop = cardRef.current.dataset.id;
            cardRef.current.dataset.placedOn = holdersArray[i].dataset.id;
            
            cardsArray.push(cardRef.current);
            setupDragHandlers(cardRef.current);
        };
    });

    // Слушатели событий
    function setupDragHandlers(card) {
        let startX, startY, offsetX, offsetY;
        let isDragging = false;
        let placedOnCard = null;
        let cardsOnTop = [];

        // Событие нажатия ЛКМ
        card.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            isDragging = true;

            // Собирание всех карт-потомков
            if (card.dataset.hasOnTop)
                cardsOnTop = getCardsOnTop(card);

            // Добавление стилей перемещения
            card.classList.add(`card_dragging`);
            card.style.transition = `transform ${delay}, box-shadow ${delay}, z-index 0s 0s`;
            card.style.zIndex = `${parseFloat(card.style.zIndex) + 1000}`;
            card.style.cursor = `grabbing`;

            cardsOnTop.forEach(c => {
                c.classList.add(`card_dragging`);
                c.style.transition = `transform ${delay}, box-shadow ${delay}, z-index 0s 0s`;
                c.style.zIndex = `${parseInt(c.style.zIndex) + 1000}`;
            });

            // Назначение начальных координат
            startX = parseFloat(card.style.left);
            startY = parseFloat(card.style.top);

            // Назначение смещения курсора относительно угла карты
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
        })

        // Событие перемещения курсора
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            // Назначение новых координат
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            // Перемещение текущей карты
            card.style.left = `${newX}px`;
            card.style.top = `${newY}px`;

            // Перемещение карт-потомков
            cardsOnTop.forEach((c, index) => {
                c.style.left = `${newX}px`;
                c.style.top = `${newY + setOffset(index)}px`;
            });

            // Проверка карты, над которой находится курсор
            placedOnCard = findCardUnder(card, cardsOnTop);

            // Подсветка карты под курсором
            cardsArray.forEach(c => {
                c.classList.remove(`card_highlight`);
                if (c === placedOnCard)
                    c.classList.add(`card_highlight`);
            });

            // Подсветка держателя карты под курсором
            holdersArray.forEach(h => {
                h.classList.remove(`card_highlight`);
                if (h === placedOnCard)
                    h.classList.add(`card_highlight`);
            });
        });

        // Событие отпускания ЛКМ
        document.addEventListener("mouseup", (e) => {
            if (!isDragging) return;
            isDragging = false;

            // Убирание стилей перемещения
            card.classList.remove(`card_dragging`);
            card.style.transition = `left ${delay}, top ${delay}, transform ${delay}, box-shadow ${delay}, z-index 0s ${delay}`;
            card.style.zIndex = `${parseInt(card.style.zIndex) - 1000}`;
            card.style.cursor = `grab`;

            cardsOnTop.forEach(c => {
                c.classList.remove(`card_dragging`);
                c.style.transition = `left ${delay}, top ${delay}, transform ${delay}, box-shadow ${delay}, z-index 0s ${delay}`;
                c.style.zIndex = `${parseInt(c.style.zIndex) - 1000}`;
            });

            // Убирание подсветки с карт и держателей
            cardsArray.forEach(c => c.classList.remove(`card_highlight`));
            holdersArray.forEach(h => h.classList.remove(`card_highlight`));

            // Проверка карты, над которой находится курсор
            placedOnCard = findCardUnder(card, cardsOnTop);

            if (placedOnCard) {
                // Размещение текущей карты с отступом
                const cRect = placedOnCard.getBoundingClientRect();
                card.style.zIndex = `${parseInt(placedOnCard.style.zIndex) + 1}`;
                card.style.left = `${cRect.left}px`;
                card.style.top = `${holdersArray.includes(placedOnCard) ? cRect.top : cRect.top + setOffset(0)}px`;

                // Очистка связей родитель/потомок
                if (card.dataset.placedOn) {
                    let placedOn = cardsArray.find(c => c.dataset.id === card.dataset.placedOn);
                    placedOn = placedOn ? placedOn : holdersArray.find(h => h.dataset.id === card.dataset.placedOn);
                    placedOn.dataset.hasOnTop = "";
                };

                // Обновление связей родитель/потомок
                card.dataset.placedOn = placedOnCard.dataset.id;
                placedOnCard.dataset.hasOnTop = card.dataset.id;

                // Обновление начальных координат
                card.dataset.initialTop = parseFloat(card.style.top);
                card.dataset.initialLeft = parseFloat(card.style.left);

                // Размещение карт-потомков с отступом
                cardsOnTop.forEach((c, index) => {
                    c.style.zIndex = `${parseInt(card.style.zIndex) + index + 1}`;
                    c.style.left = `${parseFloat(card.style.left)}px`;
                    c.style.top = `${parseFloat(card.style.top) + setOffset(index)}px`;
                    c.dataset.initialLeft = parseFloat(c.style.left);
                    c.dataset.initialTop = parseFloat(c.style.top);
                });

            } else {
                // Возврат карт на начальные координаты
                returnToInitialPosition(card, cardsOnTop);
            };

            cardsOnTop = [];
        });

        // Событие изменения размера экрана
        window.addEventListener("resize", (e) => {
            // Поиск родительского держателя карты
            let parentID = card.dataset.placedOn;
            while (cardsArray.find(c => c.dataset.id === parentID)) {
                parentID = cardsArray.find(c => c.dataset.id === parentID).dataset.placedOn;
            };

            // Назначение параметров переноса карты
            const hRect = holdersArray.find(h => h.dataset.id === parentID).getBoundingClientRect();
            const zIndex = parseFloat(card.style.zIndex);
            const offset = setOffset(zIndex > 1000 ? zIndex - 1002 : zIndex - 2);

            // Обновление начальных координат 
            card.dataset.initialLeft = hRect.left;
            card.dataset.initialTop = hRect.top + offset;

            // Размещение карты с отступами
            card.style.left = `${hRect.left}px`;
            card.style.top = `${hRect.top + offset}px`;

            // Предотвращение дёргания карт
            card.style.transition = `transform ${delay}, box-shadow ${delay}, z-index 0s 0s`;
        });
    };

    // Назначение величины отступа
    function setOffset(index) {
        return initialOffset * (index + 1);
    };

    // Поиск карты под текущей
    function findCardUnder(card, cardsOnTop) {
        // Поиск центра текущей карты
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;

        // Поиск карты, содержащей центр текущей
        for (let i = cardsArray.length - 1; i >= 0; i--) {
            const c = cardsArray[i];
            if (cardsOnTop.includes(c) || c === card || c.dataset.hasOnTop) continue;
            const cRect = c.getBoundingClientRect();
            if (
                centerX >= cRect.left &&
                centerX <= cRect.right &&
                centerY >= cRect.top &&
                centerY <= cRect.bottom
            ) return c;
        };

        // Поиск держателя карты, содержащего центр текущей
        for (let i = holdersArray.length - 1; i >= 0; i--) {
            const h = holdersArray[i];
            if (h.dataset.hasOnTop) continue;
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

    // Поиск всех карт-потомков
    function getCardsOnTop(card) {
        const result = [];
        let currentId = card.dataset.hasOnTop;

        while (currentId) {
            const card = cardsArray.find(c => c.dataset.id === currentId);
            if (card) {
                result.push(card);
                currentId = card.dataset.hasOnTop;
            } else {
                currentId = null;
            };
        };

        return result;
    };

    // Возврат карт на начальные координаты
    function returnToInitialPosition(card, cardsOnTop) {
        const initialLeft = parseFloat(card.dataset.initialLeft);
        const initialTop = parseFloat(card.dataset.initialTop);

        // Возврат текущей карты
        card.style.left = `${initialLeft}px`;
        card.style.top = `${initialTop}px`;

        // Возврат карт-потомков
        cardsOnTop.forEach((c, index) => {
            c.style.left = `${initialLeft}px`;
            c.style.top = `${initialTop + setOffset(index)}px`;
        });
    };

    // Назначение динамического класса
    let className = "";
    switch (props.suit) {
        case "heart": case "diamond": className = `card__rank_type_red`; break;
        case "spade": case "club": className = `card__rank_type_black`; break;
        default: className = ``; break;
    };

    return (
        <div className={`card`} ref={cardRef}>
            <section className={`card__section_left`}>
                <span className={`card__rank ${className}`}>{props.rank}</span>
                <Suit suit={props.suit} position={`corner`} />
            </section>
            <section className={`card__section_middle`}>
                <Template suit={props.suit} rank={props.rank} />
            </section>
            <section className={`card__section_right`}>
                <span className={`card__rank ${className}`}>{props.rank}</span>
                <Suit suit={props.suit} position={`corner`} />
            </section>
        </div>
    );
};

export default Card;