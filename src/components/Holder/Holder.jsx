import './Holder.css';
import { useEffect, useRef } from "react";

function Holder(props) {
    const holderRef = useRef(null);

    useEffect(() => {
        if (holderRef.current && holderRef.current.classList.contains("field__holder")) {
            holderRef.current.dataset.id = props.id;
            holderRef.current.dataset.placedOn = "";
            holderRef.current.dataset.hasOnTop = "";
            holderRef.current.style = `z-index: 0`;
        };
    });

    return (
        <div className={props.className ? `holder ${props.className}` : `holder`} ref={holderRef}></div>
    );
};

export default Holder;