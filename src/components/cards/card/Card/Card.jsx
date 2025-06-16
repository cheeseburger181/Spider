import Suit from "../Suit/Suit";
import Template from "../Template/Template";
import './Card.css';
import { useEffect, useRef } from "react";
import { changeOffsetY, getCardsOnTop, getParentHolder, getFullStack, getCurrentStack, findCardUnder, returnToInitialPosition, flipCard } from "../../Cards/Cards";
import { cArray, hArray, fantomHolder, pRect, delayScale, delayPosition, delayRotation, delayHighlight } from "../../Cards/Cards";

function Card(props) {
    // Добавление стартовых параметров карты
    const cardRef = useRef(null);
    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.dataset.id = props.id;
            cardRef.current.dataset.initialLeft = pRect.left;
            cardRef.current.dataset.initialTop = pRect.top;
            cardRef.current.dataset.placedOn = "";
            cardRef.current.dataset.hasOnTop = "";
            cardRef.current.dataset.flipped = "false";
            cardRef.current.style = `left: ${pRect.left}px; top: ${pRect.top}px; z-index: 1`;

            cArray.push(cardRef.current);
            setupDragHandlers(cardRef.current);
        };
    });

    // Слушатели событий
    function setupDragHandlers(card) {
        let startX, startY, offsetX, offsetY;
        let isDragging = false;
        let placedOnCard = null;
        let cardsOnTop = [];
        let prevParent = null;

        // Событие нажатия ЛКМ
        card.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            if (card.dataset.flipped === "false") return;
            isDragging = true;

            // Собирание всех карт-потомков
            if (card.dataset.hasOnTop)
                cardsOnTop = getCardsOnTop(card);

            // Назначение начальных координат
            startX = parseFloat(card.style.left);
            startY = parseFloat(card.style.top);

            // Назначение смещения курсора относительно угла карты
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;

            // Очистка связей родитель/потомок
            prevParent = cArray.find(c => c.dataset.id === card.dataset.placedOn);
            if (prevParent === undefined) prevParent = hArray.find(h => h.dataset.id === card.dataset.placedOn);
            prevParent.dataset.hasOnTop = "";
            fantomHolder.dataset.hasOnTop = card.dataset.id;
            card.dataset.placedOn = fantomHolder.dataset.id;

            // Назначение отступов
            changeOffsetY(getFullStack(getParentHolder(prevParent)));
            changeOffsetY(getCurrentStack(card));

            // Добавление стилей перемещения
            card.classList.add(`card_dragging`);
            card.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s`;
            card.style.zIndex = `${parseFloat(card.style.zIndex) + 1000}`;
            card.style.cursor = `grabbing`;

            cardsOnTop.forEach(c => {
                c.classList.add(`card_dragging`);
                c.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s`;
                c.style.zIndex = `${parseInt(c.style.zIndex) + 1000}`;
            });
        });

        // Событие перемещения курсора
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            // Назначение новых координат
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            // Перемещение текущей карты
            card.style.left = `${newX}px`;
            card.style.top = `${newY}px`;
            card.style.transition = `left 0s, top 0s, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s`;

            // Перемещение карт-потомков
            cardsOnTop.forEach((c) => {
                c.style.left = `${newX}px`;
                c.style.top = `${newY}px`;
                c.style.transition = `left 0s, top 0s, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s`;
            });

            // Назначение отступов
            changeOffsetY(getCurrentStack(card));

            // Проверка карты, над которой находится курсор
            placedOnCard = findCardUnder(card, cardsOnTop, prevParent);

            // Подсветка карты под курсором
            cArray.forEach(c => {
                c.classList.remove(`card_highlight`);
                if (c === placedOnCard) {
                    c.classList.add(`card_highlight`);
                    c.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayHighlight}, background-color ${delayHighlight}, transform 0s, z-index 0s`;
                };
            });

            // Подсветка держателя карты под курсором
            hArray.forEach(h => {
                h.classList.remove(`card_highlight`);
                if (h === placedOnCard) {
                    h.classList.add(`card_highlight`);
                    h.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayHighlight}, background-color ${delayHighlight}, transform 0s, z-index 0s`;
                };
            });
        });

        // Событие отпускания ЛКМ
        document.addEventListener("mouseup", (e) => {
            if (!isDragging) return;
            isDragging = false;

            // Убирание стилей перемещения
            card.classList.remove(`card_dragging`);
            card.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s ${delayPosition}`;
            card.style.zIndex = `${parseInt(card.style.zIndex) - 1000}`;
            card.style.cursor = `grab`;

            cardsOnTop.forEach(c => {
                c.classList.remove(`card_dragging`);
                c.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow ${delayScale}, background-color 0s, transform ${delayScale}, z-index 0s ${delayPosition}`;
                c.style.zIndex = `${parseInt(c.style.zIndex) - 1000}`;
            });

            // Убирание подсветки с карт и держателей
            cArray.forEach(c => c.classList.remove(`card_highlight`));
            hArray.forEach(h => h.classList.remove(`card_highlight`));

            // Проверка карты, над которой находится курсор
            placedOnCard = findCardUnder(card, cardsOnTop, prevParent);

            if (placedOnCard) {
                // Размещение текущей карты
                const cRect = placedOnCard.getBoundingClientRect();
                card.style.zIndex = `${parseInt(placedOnCard.style.zIndex) + 1}`;
                card.style.left = `${cRect.left}px`;
                card.style.top = `${cRect.top}px`;

                // Обновление связей родитель/потомок
                card.dataset.placedOn = placedOnCard.dataset.id;
                placedOnCard.dataset.hasOnTop = card.dataset.id;
                fantomHolder.dataset.hasOnTop = "";

                // Обновление начальных координат
                card.dataset.initialTop = parseFloat(card.style.top);
                card.dataset.initialLeft = parseFloat(card.style.left);

                // Размещение карт-потомков
                cardsOnTop.forEach((c, index) => {
                    c.style.zIndex = `${parseInt(card.style.zIndex) + index + 1}`;
                    c.style.left = `${parseFloat(card.style.left)}px`;
                    c.style.top = `${parseFloat(card.style.top)}px`;
                    c.dataset.initialLeft = parseFloat(c.style.left);
                    c.dataset.initialTop = parseFloat(c.style.top);
                });

                if (prevParent.dataset.flipped === "false") {
                    flipCard(prevParent);
                    prevParent.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow 0s, background-color 0s, transform ${delayRotation}, z-index 0s ${delayPosition}`;
                };

                // Назначение отступов
                changeOffsetY(getFullStack(getParentHolder(card)));

            } else {
                // Возврат карт на начальные координаты
                returnToInitialPosition(card, cardsOnTop, prevParent);
            };

            cardsOnTop = [];
        });

        // Событие нажатия ПКМ
        card.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            flipCard(card);
            card.style.transition = `left ${delayPosition}, top ${delayPosition}, box-shadow 0s, background-color 0s, transform ${delayRotation}, z-index 0s ${delayPosition}`;
        });
    };

    // Назначение динамического класса
    let className = "";
    switch (props.suit) {
        case "heart": case "diamond": className = `card__rank_type_red`; break;
        case "spade": case "club": className = `card__rank_type_black`; break;
        default: className = ``; break;
    };

    // Создание DOM-структуры карты
    return (
        <div className={`card card_flipped`} ref={cardRef}>
            <div className={`card__front`}>
                <section className={`card__section_left`}>
                    <span className={`card__rank ${className}`}>{props.rank}</span>
                    <Suit suit={props.suit} position={`side`} />
                </section>
                <section className={`card__section_middle`}>
                    <Template suit={props.suit} rank={props.rank} />
                </section>
                <section className={`card__section_right`}>
                    <span className={`card__rank ${className}`}>{props.rank}</span>
                    <Suit suit={props.suit} position={`side`} />
                </section>
            </div>
            <div className={`card__back`}></div>
        </div>
    );
};

export default Card;