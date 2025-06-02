import Holder from "../Holder/Holder";
import "./Holders.css"
import { forwardRef } from "react";

const Holders = forwardRef((props, ref) => {
    const container = [];

    for (let i = 0; i < props.num; i++)
        container.push(<Holder key={i} id={`h${i}`} />);

    return (
        <div className="field" ref={ref}>
            {container}
        </div>
    );
});

export default Holders;