import Cards from "./components/cards/Cards/Cards";
import Main from "./components/Main/Main";
import { useEffect, useState } from "react";

function App(props) {
  const [cards, setCards] = useState(null);
  useEffect(() => {
      setCards(<Cards numCards={props.numCards} numHolders={props.numHolders} />);
  }, []);

  return (
    <>
      <Main numHolders={props.numHolders}/>
      {cards}
    </>
  );
};

export default App;