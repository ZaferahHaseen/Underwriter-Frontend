import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProposalDetails.css";


function ProposalDetails(){

const {id}=useParams();

const navigate=useNavigate();


return(

<div className="proposal-container">

<h1>Proposal Details</h1>


<div className="proposal-card">


<h2>Client Information</h2>

<p><b>Name:</b> Rahul Kumar</p>

<p><b>Age:</b> 42</p>

<p><b>Occupation:</b> Software Engineer</p>

<p><b>Location:</b> Chennai</p>



<h2>Insurance Details</h2>

<p><b>Policy Type:</b> Health Insurance</p>

<p><b>Coverage Amount:</b> ₹10,00,000</p>

<p><b>Duration:</b> 10 Years</p>



<h2>Documents</h2>

<ul>

<li>Medical Report</li>

<li>Income Proof</li>

<li>Identity Proof</li>

</ul>



<button
onClick={()=>navigate("/risk-analysis/"+id)}
>
Analyze Risk
</button>


</div>


</div>


)

}


export default ProposalDetails;