import Face from "../Face/Face";
import Suit from "../Suit/Suit";
import './Template.css';

const ranks = [
    { name: "A", position: [8] },
    { name: "2", position: [3, 10] },
    { name: "3", position: [3, 8, 10] },
    { name: "4", position: [1, 3, 10, 12] },
    { name: "5", position: [1, 3, 8, 10, 12] },
    { name: "6", position: [1, 3, 7, 9, 12, 13] },
    { name: "7", position: [1, 3, 5, 7, 9, 12, 13] },
    { name: "8", position: [1, 3, 4, 6, 7, 9, 10, 12] },
    { name: "9", position: [1, 3, 4, 6, 7, 8, 9, 10, 12] },
    { name: "10", position: [1, 3, 4, 5, 6, 7, 9, 10, 11, 12] },
    { name: "J", position: [1, 2] },
    { name: "Q", position: [1, 2] },
    { name: "K", position: [1, 2] }
];

function TemplateA(props) {
    const container = [];
    for (let i = 1; i < 14; i++) {
        if (ranks.find(item => item.name === props.rank).position.includes(i))
            container.push(<Suit key={i} className={`card__grid_template_a_${i}`} suit={props.suit} position={`middle`} />);
        else
            container.push(<div className={`card__grid_template_a_${i}`} position={`middle`}></div>);
    };
    return container;
};

function TemplateB(props) {
    const container = [];
    for (let i = 1; i < 14; i++) {
        if (ranks.find(item => item.name === props.rank).position.includes(i))
            container.push(<Suit key={i} className={`card__grid_template_b_${i}`} suit={props.suit} position={`middle`} />);
        else
            container.push(<div className={`card__grid_template_b_${i}`} position={`middle`}></div>);
    };
    return container;
};

function TemplateC(props) {
    const container = [];
    for (let i = 1; i < 3; i++)
        container.push(<Face key={i} className={`card__grid_template_c_${i}`} suit={props.suit} rank={props.rank} />);
    return container;
};

function Template(props) {
    switch (props.rank) {
        case "A": case "2": case "3": case "4": case "5": case "8": case "9": case "10":
            return <TemplateA suit={props.suit} rank={props.rank} />;
        case "6": case "7":
            return <TemplateB suit={props.suit} rank={props.rank} />;
        case "J": case "Q": case "K":
            return <TemplateC suit={props.suit} rank={props.rank} />;
        default: return null;
    };
};

export default Template;