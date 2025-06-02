import './Holder.css'
import { useEffect, useRef } from "react";
import { holdersArray } from "../../../App";

function Holder(props) {
    const holderRef = useRef(null);

    useEffect(() => {
        if (holderRef.current) {
            holderRef.current.dataset.id = props.id;
            holderRef.current.dataset.placedOn = "";
            holderRef.current.dataset.hasOnTop = "";
            holderRef.current.style = `z-index: 0`;

            holdersArray.push(holderRef.current);
        };
    });

    return (
        <div className={`holder`} ref={holderRef}></div>
    );
};

export default Holder;