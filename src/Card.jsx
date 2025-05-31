import Grid from "./Grid";
import Icon from "./Icon";
import { useEffect, useRef } from "react";
import { cardsArray, holdersArray } from "./App";

function Card(props) {
    let STACK_OFFSET = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--width-card')) * 0.325

    const cardRef = useRef(null)

    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.dataset.id = props.id;
            cardRef.current.dataset.initialleft = props.left;
            cardRef.current.dataset.initialtop = props.top;
            cardRef.current.dataset.placedon = '';
            cardRef.current.dataset.hasontop = '';
            cardRef.current.style = `left: ${props.left}px; top: ${props.top}px; z-index: 0`;

            cardsArray.push(cardRef.current);
            setupDragHandlers(cardRef.current);

            console.log("sus")

            const cRect = cardRef.current.getBoundingClientRect()
            holdersArray.forEach(h => {
                const hRect = h.getBoundingClientRect()
                if (cRect.left === hRect.left && cRect.top === hRect.top) {
                    h.dataset.hasontop = cardRef.current.dataset.id
                    cardRef.current.dataset.placedon = h.dataset.id
                }
            })
        }
    }, [])

    function setupDragHandlers(card) {
        let startX, startY, offsetX, offsetY;
        let isDragging = false;
        let placedOnCard = null;
        let cardsOnTop = [];

        card.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Только ЛКМ

            // Если на этом прямоугольнике есть другие, собираем их
            if (card.dataset.hasontop) {
                cardsOnTop = getCardsOnTop(card);
            }

            isDragging = card;
            card.classList.add('card_dragging');
            card.style.transition = 'transform 0.2s, box-shadow 0.2s, z-index 0s';
            card.style.zIndex = `${parseFloat(card.style.zIndex) + 100}`;
            card.style.cursor = 'grabbing';

            cardsOnTop.forEach(topRect => {
                topRect.classList.add('card_dragging');
                topRect.style.transition = 'transform 0.2s, box-shadow 0.2s, z-index 0s';
                topRect.style.zIndex = `${parseInt(topRect.style.zIndex) + 100}`;
            });

            // Запоминаем начальные координаты
            startX = parseFloat(card.style.left);
            startY = parseFloat(card.style.top);

            // Смещение курсора относительно угла прямоугольника
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;

            e.preventDefault();
        })

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Новые координаты
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;

            // Перемещаем основной прямоугольник
            card.style.left = `${newX}px`;
            card.style.top = `${newY}px`;

            let relativeY = 0;

            // Перемещаем все прямоугольники сверху
            cardsOnTop.forEach(topCard => {
                relativeY += STACK_OFFSET;
                topCard.style.left = `${newX}px`;
                topCard.style.top = `${newY + relativeY}px`;
            });

            // Проверяем, над каким прямоугольником находимся
            placedOnCard = findCardUnder(card, cardsOnTop);

            // Подсвечиваем прямоугольник под курсором
            cardsArray.forEach(c => {
                c.classList.remove('card_highlight');
                if (c === placedOnCard) {
                    c.classList.add('card_highlight');
                }
            });
            holdersArray.forEach(h => {
                h.classList.remove('card_highlight');
                if (h === placedOnCard) {
                    h.classList.add('card_highlight');
                }
            });
        })

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;

            card.classList.remove('card_dragging');
            card.style.transition = 'left 0.2s, top 0.2s, transform 0.2s, box-shadow 0.2s, z-index 0.2s';
            card.style.zIndex = `${parseInt(card.style.zIndex) - 100}`;
            card.style.cursor = 'grab';

            cardsOnTop.forEach(topRect => {
                topRect.classList.remove('card_dragging');
                topRect.style.transition = 'left 0.2s, top 0.2s, transform 0.2s, box-shadow 0.2s, z-index 0.2s';
                topRect.style.zIndex = `${parseInt(topRect.style.zIndex) - 100}`;
            });

            // Убираем подсветку со всех
            cardsArray.forEach(r => r.classList.remove('card_highlight'));
            holdersArray.forEach(h => h.classList.remove('card_highlight'));

            // Проверяем, можно ли разместить на этом прямоугольнике
            placedOnCard = findCardUnder(card, cardsOnTop);

            if (placedOnCard) {
                let offset = (holdersArray.includes(placedOnCard)) ? 0: STACK_OFFSET

                // Размещаем с небольшим смещением
                const placedRect = placedOnCard.getBoundingClientRect();

                card.style.left = `${placedRect.left}px`;
                card.style.top = `${placedRect.top + offset}px`;
                card.style.zIndex = `${parseInt(placedOnCard.style.zIndex) + 1} `;

                // Очищаем связи
                if (card.dataset.placedon) {
                    const placedOn = cardsArray.find(r => r.dataset.id === card.dataset.placedon) ? cardsArray.find(r => r.dataset.id === card.dataset.placedon) : holdersArray.find(h => h.dataset.id === card.dataset.placedon);
                    placedOn.dataset.hasontop = '';
                }

                // Обновляем данные
                card.dataset.placedon = placedOnCard.dataset.id;
                placedOnCard.dataset.hasontop = card.dataset.id;

                // Обновляем начальную позицию
                card.dataset.initialtop = parseFloat(card.style.top);
                card.dataset.initialleft = parseFloat(card.style.left);

                let relativeY = 0;
                let zIndex = 0;

                // Перемещаем все прямоугольники сверху
                cardsOnTop.forEach(topRect => {
                    relativeY += STACK_OFFSET;
                    topRect.style.left = `${parseFloat(card.style.left)}px`;
                    topRect.style.top = `${parseFloat(card.style.top) + relativeY}px`;
                    topRect.dataset.initialtop = parseFloat(topRect.style.top);
                    topRect.dataset.initialleft = parseFloat(topRect.style.left);
                    topRect.style.zIndex = `${parseInt(card.style.zIndex) + ++zIndex}`;
                });
            } else {
                // Не над прямоугольником - возвращаем на место
                returnToInitialPosition(card, cardsOnTop);
            }
            cardsOnTop = [];
        })
    }

    // Поиск прямоугольника под текущим
    function findCardUnder(currentCard, cardsOnTop) {
        const card = currentCard.getBoundingClientRect();
        const centerX = card.left + card.width / 2;
        const centerY = card.top + card.height / 2;

        // Ищем прямоугольник, содержащий центр текущего
        for (let i = cardsArray.length - 1; i >= 0; i--) {
            const c = cardsArray[i];

            if (cardsOnTop.includes(c) || c === currentCard || c.dataset.hasontop) continue;
            const cRect = c.getBoundingClientRect();
            if (
                centerX >= cRect.left &&
                centerX <= cRect.right &&
                centerY >= cRect.top &&
                centerY <= cRect.bottom
            ) {
                return c;
            }
        }

        for (let i = holdersArray.length - 1; i >= 0; i--) {
            const h = holdersArray[i];

            if (h.dataset.hasontop) continue;
            const hRect = h.getBoundingClientRect();
            if (
                centerX >= hRect.left &&
                centerX <= hRect.right &&
                centerY >= hRect.top &&
                centerY <= hRect.bottom
            ) {
                return h;
            }
        }
        return null;
    }

    // Получение всех прямоугольников сверху (включая вложенные)
    function getCardsOnTop(baseCard) {
        const result = [];
        let currentId = baseCard.dataset.hasontop;

        while (currentId) {
            const card = cardsArray.find(c => c.dataset.id === currentId);
            if (card) {
                result.push(card);
                currentId = card.dataset.hasontop;
            } else {
                currentId = null;
            }
        }

        return result;
    }

    // Возврат на начальную позицию
    function returnToInitialPosition(rect, cardsOnTop) {
        const initialLeft = parseFloat(rect.dataset.initialleft);
        const initialTop = parseFloat(rect.dataset.initialtop);

        rect.style.left = `${initialLeft}px`;
        rect.style.top = `${initialTop}px`;

        let relativeY = 0;

        // Перемещаем все прямоугольники сверху
        cardsOnTop.forEach(topRect => {
            relativeY += STACK_OFFSET;
            topRect.style.left = `${initialLeft}px`;
            topRect.style.top = `${initialTop + relativeY}px`;
        });
    }

    return (
        <div className={`card`} ref={cardRef}>
            <section className={`card__section_left`}>
                <span className={`card__rank card__suit_type_${props.suit}`}>{props.rank}</span>
                <Icon className={`card__suit_place_corner`} suit={props.suit} />
            </section>
            <section className={`card__section_middle`}>
                <Grid suit={props.suit} rank={props.rank} />
            </section>
            <section className={`card__section_right`}>
                <span className={`card__rank card__suit_type_${props.suit}`}>{props.rank}</span>
                <Icon className={`card__suit_place_corner`} suit={props.suit} />
            </section>
        </div>
    );
}

export default Card;