import HorizonCalculator from './components/HorizonCalculator.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>
        Horizon Calculator
      </h1>
      Calculate the apparent horizon from a given location
      <HorizonCalculator />
    </div>
  );
}

export default App;
