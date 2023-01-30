import HorizonCalculator from './components/HorizonCalculator.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>
        Horizon Calculator
      </h1>
      Created by Neil Bassett
      (using <a href="https://open-elevation.com/">Open Elevation API</a>)
      <br/><br/>
      <HorizonCalculator />
    </div>
  );
}

export default App;
