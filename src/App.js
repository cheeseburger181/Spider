import { useEffect, useRef, useState } from "react";
import Card from "./components/cards/card/Card/Card";
import Holders from "./components/holders/Holders/Holders";

export let cardsArray = []
export let holdersArray = []

function App() {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const suits = ["heart", "spade", "diamond", "club"]

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const container = []
  const fieldRef = useRef(null)
  const [state, setState] = useState([])

  useEffect(() => {
    if (fieldRef.current) {
      let i = 0
      fieldRef.current.childNodes.forEach(n => {
        const nRect = n.getBoundingClientRect();
        container.push(<Card key={i++} rank={ranks[getRandomInt(13)]} suit={suits[getRandomInt(4)]} id={`c${i++}`} left={nRect.left} top={nRect.top} />)
        setState(container)
      })
    }
  }, [])


  return (
    <div className="App">
      <Holders ref={fieldRef} num={10} />
      <div className="cards">
        {state}
      </div>
    </div>
  );
}

export default App;