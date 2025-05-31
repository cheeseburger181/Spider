import { forwardRef } from "react";
import Holder from "./Holder";

const PlayField = forwardRef((props, ref) => {
    const container = []

    for (let i = 0; i < props.num; i++) {
        container.push(<Holder key={i} id={`h${i}`} />)
    }

    return (
        <div className="field" ref={ref}>
            {container}
        </div>
    );
})

export default PlayField;