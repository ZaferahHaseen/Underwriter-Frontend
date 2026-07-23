import "./ClientDashboard.css";

function ClientDashboard() {
  return (
    <div className="client-page">

      <div className="welcome">
        <h1>Welcome, Client</h1>
        <p>Submit your insurance proposal and track your application status.</p>
      </div>


      <div className="proposal-container">

        <h2>Apply for Insurance Proposal</h2>

        <form>

          <label>Insurance Type</label>
          <select>
            <option>Select Insurance</option>
            <option>Health Insurance</option>
            <option>Vehicle Insurance</option>
            <option>Life Insurance</option>
          </select>


          <label>Full Name</label>
          <input 
            type="text" 
            placeholder="Enter your name"
          />


          <label>Age</label>
          <input 
            type="number" 
            placeholder="Enter your age"
          />


          <label>Coverage Amount</label>
          <input 
            type="text" 
            placeholder="Enter coverage amount"
          />


          <label>Additional Details</label>
          <textarea 
            placeholder="Enter medical history or other details">
          </textarea>


          <button type="submit">
            Submit Proposal
          </button>


        </form>

      </div>



      <div className="status-box">

        <h2>Proposal Status</h2>

        <p>
          <b>Proposal ID:</b> #101
        </p>

        <p>
          <b>Status:</b> Under Review
        </p>

        <p>
          Your proposal is being analyzed by the underwriter.
        </p>

      </div>


    </div>
  );
}

export default ClientDashboard;