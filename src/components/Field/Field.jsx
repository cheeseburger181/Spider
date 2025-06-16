import Holders from "../Holders/Holders";
import "./Field.css";

function Field(props) {
    return (
        <div className="main__field">
            <Holders numHolders={props.numHolders}/>
        </div>
    );
};

export default Field;