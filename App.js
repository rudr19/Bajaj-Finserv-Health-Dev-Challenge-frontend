import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Select from 'react-select';

const API_URL = 'https://bfhl-backend-9wfy.onrender.com';
const ROLL_NUMBER = '2237889';

const filterOptions = [
  { value: 'numbers', label: 'Numbers' },
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'highest_alphabet', label: 'Highest alphabet' }
];

const baseResponseFields = ['is_success', 'user_id', 'email', 'roll_number'];

function App() {
  const [inputData, setInputData] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = ROLL_NUMBER;
  }, []);

  const validateInput = useCallback((input) => {
    try {
      const parsedData = JSON.parse(input);
      if (!parsedData.data || !Array.isArray(parsedData.data)) {
        throw new Error('Input must contain a "data" field with an array.');
      }
      return parsedData;
    } catch (err) {
      throw new Error('Invalid JSON format. Please check your input.');
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    setInputData(e.target.value);
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    setSubmitted(false);

    try {
      validateInput(inputData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: inputData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }

      setResponse(result);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [inputData, validateInput]);

  const handleFilterChange = useCallback((selectedOptions) => {
    setSelectedFilters(selectedOptions || []);
  }, []);

  const getFilteredResponse = useCallback(() => {
    if (!response) return null;
    
    const filteredResponse = baseResponseFields.reduce((acc, field) => ({
      ...acc,
      [field]: response[field]
    }), {});
    
    selectedFilters.forEach(({ value }) => {
      if (response[value] !== undefined) {
        filteredResponse[value] = response[value];
      }
    });
    
    return filteredResponse;
  }, [response, selectedFilters]);

  return (
    <div className="app-container">
      <h1>Bajaj Finserv Health Dev Challenge</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="jsonInput">Enter JSON Input:</label>
            <textarea
              id="jsonInput"
              value={inputData}
              onChange={handleInputChange}
              placeholder='{ "data": ["M","1","334","4","B"] }'
              rows={5}
              required
            />
          </div>
          
          <button type="submit" disabled={loading || !inputData.trim()}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
        
        {error && <div className="error-message" role="alert">{error}</div>}
      </div>

      {submitted && (
        <div className="filter-section">
          <h2>Filter Results</h2>
          <Select
            isMulti
            name="filters"
            options={filterOptions}
            className="multi-select"
            classNamePrefix="select"
            onChange={handleFilterChange}
            placeholder="Select filters..."
            aria-label="Select filters"
          />
        </div>
      )}

      {submitted && selectedFilters.length > 0 && (
        <div className="response-container">
          <h2>API Response</h2>
          <pre>
            {JSON.stringify(getFilteredResponse(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
