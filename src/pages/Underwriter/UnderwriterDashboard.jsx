import React from "react";
import { useNavigate } from "react-router-dom";
import "./UnderwriterDashboard.css";

function UnderwriterDashboard(){

const navigate = useNavigate();

const proposals=[
{
id:1,
name:"Rahul Kumar",
policy:"Health Insurance",
status:"Pending"
},
{
id:2,
name:"Ananya",
policy:"Life Insurance",
status:"Pending"
}
];


return(

<div className="dashboard">

<h1>Underwriter Dashboard</h1>

<div className="cards">

<div>
<h2>25</h2>
<p>Total Proposals</p>
</div>

<div>
<h2>8</h2>
<p>Pending Review</p>
</div>

<div>
<h2>12</h2>
<p>Approved</p>
</div>

<div>
<h2>5</h2>
<p>Rejected</p>
</div>


</div>


<h2>Pending Proposals</h2>


<table>

<thead>

<tr>
<th>Client</th>
<th>Policy</th>
<th>Status</th>
<th>Action</th>
</tr>

</thead>


<tbody>

{
proposals.map((p)=>(

<tr key={p.id}>

<td>{p.name}</td>

<td>{p.policy}</td>

<td>{p.status}</td>

<td>

<button
onClick={()=>navigate("/proposal/"+p.id)}
>
View
</button>

</td>

</tr>


))
}


</tbody>

</table>


</div>


)

}


export default UnderwriterDashboard;