import Icon from "./Icon";
import Face from "./Face";

const ranks = [
    {
        name: "A",
        suits: [8]
    },
    {
        name: "2",
        suits: [3, 10]
    },
    {
        name: "3",
        suits: [3, 8, 10]
    },
    {
        name: "4",
        suits: [1, 3, 10, 12]
    },
    {
        name: "5",
        suits: [1, 3, 8, 10, 12]
    },
    {
        name: "6",
        suits: [1, 3, 7, 9, 12, 13]
    },
    {
        name: "7",
        suits: [1, 3, 5, 7, 9, 12, 13]
    },
    {
        name: "8",
        suits: [1, 3, 4, 6, 7, 9, 10, 12]
    },
    {
        name: "9",
        suits: [1, 3, 4, 6, 7, 8, 9, 10, 12]
    },
    {
        name: "10",
        suits: [1, 3, 4, 5, 6, 7, 9, 10, 11, 12]
    },
    {
        name: "J",
        face: [1, 2]
    },
    {
        name: "Q",
        face: [1, 2]
    },
    {
        name: "K",
        face: [1, 2]
    }
]

function TemplateA(props) {
    const container = [];
    for (let i = 1; i < 14; i++) {
        if (ranks.find(item => item.name === props.rank).suits.includes(i))
            container.push(<Icon key={i} className={`card__grid_template_a_${i} card__suit_place_middle`} suit={props.suit} />)
        else
            container.push(<div className={`card__grid_template_a_${i} card__suit_place_middle`}></div>)
    }
    return container
}

function TemplateB(props) {
    const container = [];
    for (let i = 1; i < 14; i++) {
        if (ranks.find(item => item.name === props.rank).suits.includes(i))
            container.push(<Icon key={i} className={`card__grid_template_b_${i} card__suit_place_middle`} suit={props.suit} />)
        else
            container.push(<div className={`card__grid_template_b_${i} card__suit_place_middle`}></div>)
    }
    return container
}

function TemplateC(props) {
    const container = [];
    for (let i = 1; i < 3; i++) {
        if (ranks.find(item => item.name === props.rank).face.includes(i))
            container.push(<Face key={i} className={`card__grid_template_c_${i} card__suit_type_${props.suit} card__face`} suit={props.suit} rank={props.rank} />)
        else
            container.push(<div className={`card__grid_template_c_${i} card__suit_place_middle`}></div>)
    }
    return container
}

function Grid(props) {
    switch (props.rank) {
        case "A": case "2": case "3": case "4": case "5": case "8": case "9": case "10":
            return <TemplateA suit={props.suit} rank={props.rank} />
        case "6": case "7":
            return <TemplateB suit={props.suit} rank={props.rank} />
        case "J": case "Q": case "K":
            return <TemplateC suit={props.suit} rank={props.rank} />
    }
}

export default Grid;