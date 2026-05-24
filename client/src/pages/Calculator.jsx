const Calculator = () => {
  return (
    <div className="page">
      <h1>Risk Calculator</h1>

      <div className="calculator-box">
        
        <label>
          <input type="checkbox" />
          Asked for OTP
        </label>

        <label>
          <input type="checkbox" />
          Asked for bank details
        </label>

        <label>
          <input type="checkbox" />
          Threatened arrest
        </label>

        <button>Calculate Risk</button>
      </div>
    </div>
  );
};

export default Calculator;