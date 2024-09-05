import logo from './logo.svg';
import './App.css';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [visitedIndexes, setVisitedIndexes] = useState([]);
  const [values, setValues] = useState({});
  const indexRef = useRef(null);

  const submitIndex = async () => {
    console.log('submit');

    const response = await axios.post('/api/values', {
      index: indexRef.current.value,
    });

    console.log(response.data);
  };

  console.log(visitedIndexes);

  useEffect(() => {
    axios('/api/values/all').then(({ data }) => setVisitedIndexes(data));
  }, []);

  useEffect(() => {
    axios('/api/values/current').then(({ data }) => setValues(data));
  }, []);

  return (
    <div className='App'>
      <label>Index</label>
      <input ref={indexRef} />

      <button onClick={submitIndex}>Submit</button>

      <div>
        <h4>Index visités</h4>
        {visitedIndexes.map(({ number }) => (
          <span>{number}</span>
        ))}
      </div>

      <div>
        <h4>Computation</h4>
        {Object.entries(values).map(([index, value]) => (
          <p>
            Index = {index} , valeur de Fib = {value}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
