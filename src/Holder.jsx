import { useEffect, useRef } from "react";
import { holdersArray } from "./App"

function Holder(props) {
    const holderRef = useRef(null)

    console.log()
    useEffect(() => {
        if (holderRef.current) {
            holderRef.current.dataset.id = props.id;
            holderRef.current.dataset.hasontop = '';
            holderRef.current.style = `z-index: -1`;

            holdersArray.push(holderRef.current);
        }
    }, [])

    return (
        <div className="holder" ref={holderRef}></div>
    );
}

export default Holder;