import logo from './logo.svg';
import CoordinateForm from './components/CoordinateForm.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>
        Horizon Calculator
      </h1>
      Calculate the apparent horizon from a given location
      <p>
        <CoordinateForm />
      </p>
    </div>
  );
}

export default App;
