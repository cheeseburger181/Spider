import Holder from "../Holder/Holder";
import "./Holders.css"

function Holders(props) {
    const container = [];

    for (let i = 0; i < props.numHolders; i++)
        container.push(<Holder key={i} className={"field__holder"} id={`h${i}`} />);

    return (
        <div className="holders">
            {container}
        </div>
    );
};

export default Holders;