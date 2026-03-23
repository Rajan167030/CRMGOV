import T from "../constants/tokens";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
export const COMPLAINTS = [
  { id:"CMP-2401", citizen:"Rajesh Kumar",  phone:"9876543210", dept:"Water Supply",  status:"In Progress", priority:"High",     sla:2,  location:"Sector 14, Delhi",        desc:"No water supply for 3 days in the entire block. Residents are suffering badly.", created:"2025-03-06", assigned:"Officer Mehta" },
  { id:"CMP-2400", citizen:"Priya Sharma",  phone:"9812345678", dept:"Road Works",    status:"Resolved",    priority:"Medium",   sla:0,  location:"MG Road, Bangalore",      desc:"Large pothole near signal causing accidents. Multiple vehicles damaged.", created:"2025-03-05", assigned:"Officer Das" },
  { id:"CMP-2399", citizen:"Ahmed Khan",    phone:"9988776655", dept:"Electricity",   status:"Escalated",   priority:"Critical", sla:-1, location:"HITEC City, Hyderabad",   desc:"Transformer blown. Entire colony without power for 36 hours.", created:"2025-03-04", assigned:"Officer Rao" },
  { id:"CMP-2398", citizen:"Sunita Patel",  phone:"9765432109", dept:"Sanitation",    status:"Pending",     priority:"Low",      sla:5,  location:"Andheri West, Mumbai",    desc:"Garbage not collected for 5 days. Foul smell affecting all residents.", created:"2025-03-07", assigned:"Unassigned" },
  { id:"CMP-2397", citizen:"Vikram Singh",  phone:"9654321098", dept:"Transport",     status:"In Progress", priority:"Medium",   sla:1,  location:"Sector 22, Chandigarh",   desc:"Bus route 44C discontinued without notice. Daily commuters affected.", created:"2025-03-05", assigned:"Officer Gill" },
  { id:"CMP-2396", citizen:"Meena Reddy",   phone:"9543210987", dept:"Public Health", status:"Resolved",    priority:"High",     sla:0,  location:"Jubilee Hills, Hyderabad",desc:"Stagnant water causing mosquito breeding near park. Dengue risk.", created:"2025-03-03", assigned:"Officer Kumar" },
  { id:"CMP-2395", citizen:"Arjun Nair",    phone:"9432109876", dept:"Water Supply",  status:"Pending",     priority:"Medium",   sla:3,  location:"Koramangala, Bangalore",  desc:"Water pressure extremely low. Cannot fill tanks for last 2 days.", created:"2025-03-07", assigned:"Unassigned" },
  { id:"CMP-2394", citizen:"Divya Iyer",    phone:"9321098765", dept:"Road Works",    status:"Escalated",   priority:"Critical", sla:-3, location:"T Nagar, Chennai",        desc:"Road cave-in near school. Emergency situation. Children at risk.", created:"2025-03-01", assigned:"Officer Suresh" },
];

export const DEPTS = [
  { id:1, name:"Water Supply",  icon:"💧", complaints:342, resolved:298, pending:44,  color:T.cyan,   officer:"Suresh Mehta",   email:"water@pscrm.gov" },
  { id:2, name:"Road Works",    icon:"🛣️", complaints:521, resolved:401, pending:120, color:T.amber,  officer:"Priti Das",      email:"roads@pscrm.gov" },
  { id:3, name:"Electricity",   icon:"⚡", complaints:189, resolved:175, pending:14,  color:"#FBBF24", officer:"Ravi Rao",       email:"elec@pscrm.gov"  },
  { id:4, name:"Sanitation",    icon:"🗑️", complaints:267, resolved:230, pending:37,  color:T.green,  officer:"Anil Sharma",    email:"sanit@pscrm.gov" },
  { id:5, name:"Public Health", icon:"🏥", complaints:98,  resolved:91,  pending:7,   color:T.red,    officer:"Dr. Lata Singh", email:"health@pscrm.gov"},
  { id:6, name:"Transport",     icon:"🚌", complaints:445, resolved:378, pending:67,  color:T.purple, officer:"Harjit Gill",    email:"trans@pscrm.gov" },
];

export const MONTHLY = [
  {m:"Aug",v:820},{m:"Sep",v:940},{m:"Oct",v:1120},{m:"Nov",v:980},
  {m:"Dec",v:870},{m:"Jan",v:1240},{m:"Feb",v:1380},{m:"Mar",v:1190},
];
