import logo from './logo.svg';
import CoordinateForm from './components/CoordinateForm.js';
import { LineChart, Line, CartesianGrid, XAxis,
  YAxis, ResponsiveContainer } from 'recharts';
import './App.css';

const exampleData = [{azimuth : 0, horizon : 1},
  {azimuth : 1, horizon : 2},
  {azimuth : 2, horizon : 3},
  {azimuth : 3, horizon : 1},
  {azimuth : 4, horizon : 1},
  {azimuth : 5, horizon : 2}];

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
      <p>
        <ResponsiveContainer width='100%' height={500}>
          <LineChart
            width={600}
            height={300}
            data={exampleData}
            margin={{top: 25, right: 70, left: 30, bottom: 25}}
          >
            <Line type="monotone" dataKey="horizon" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="azimuth"
              label={{ value: 'Azimuthal Angle (deg)', dy: 25}}
            />
            <YAxis
              label={{ value: 'Horizon Angle (deg)', angle: -90, dx: -25}}
            />
          </LineChart>
        </ResponsiveContainer>
      </p>
    </div>
  );
}

export default App;
