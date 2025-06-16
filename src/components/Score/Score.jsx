import Holder from "../Holder/Holder";
import "./Score.css";

function Score() {
    return (
        <div className="main__score">
            <Holder className="main__score_left"/>
            <Holder className="main__score_right"/>
        </div>
    );
};

export default Score;