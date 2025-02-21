import React, { useState, useEffect } from 'react';
import './App.css';
import Select from 'react-select';


const API_URL = 'https://bfhl-backend-9wfy.onrender.com';
const ROLL_NUMBER = '2237889';

function App() {
  const [inputData, setInputData] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Update document title on component mount
  useEffect(() => {
    document.title = ROLL_NUMBER;
  }, []);

  // Filter options for multi-select dropdown
  const filterOptions = [
    { value: 'numbers', label: 'Numbers' },
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'highest_alphabet', label: 'Highest alphabet' }
  ];

  // Handle input change
  const handleInputChange = (e) => {
    setInputData(e.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    setSubmitted(false);

    try {
      // Validate JSON format
      let parsedData;
      try {
        parsedData = JSON.parse(inputData);
      } catch (err) {
        throw new Error('Invalid JSON format. Please check your input.');
      }

      // Validate data structure
      if (!parsedData.data || !Array.isArray(parsedData.data)) {
        throw new Error('Input must contain a "data" field with an array.');
      }

      // Make API call
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
  };

  // Handle filter selection change
  const handleFilterChange = (selectedOptions) => {
    setSelectedFilters(selectedOptions || []);
  };

  // Filter response based on selected filters
  const getFilteredResponse = () => {
    if (!response) return null;
    
    const filteredResponse = {};
    const selectedKeys = selectedFilters.map(filter => filter.value);
    
    // Always include these fields
    filteredResponse.is_success = response.is_success;
    filteredResponse.user_id = response.user_id;
    filteredResponse.email = response.email;
    filteredResponse.roll_number = response.roll_number;
    
    // Add selected fields based on filters
    selectedKeys.forEach(key => {
      if (response[key] !== undefined) {
        filteredResponse[key] = response[key];
      }
    });
    
    return filteredResponse;
  };

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
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
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
