import Field from "../Field/Field";
import Score from "../Score/Score";
import "./Main.css";

function Main(props) {
    return (
        <main className="main">
            <Score />
            <Field numHolders={props.numHolders}/>
        </main>
    );
};

export default Main;