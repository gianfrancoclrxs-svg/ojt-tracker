const firebaseConfig = {
    apiKey: "SECRETT",
    authDomain: "ojttracking-2d004.firebaseapp.com",
    projectId: "ojttracking-2d004",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById("showSignUp")?.addEventListener("click",()=>{
  document.getElementById("loginForm").style.display="none";
  document.getElementById("signUpForm").style.display="block";
});
document.getElementById("showLogin")?.addEventListener("click",()=>{
  document.getElementById("signUpForm").style.display="none";
  document.getElementById("loginForm").style.display="block";
});

document.getElementById("signUpBtn")?.addEventListener("click",async()=>{
  const fullName=document.getElementById("fullName").value.trim();
  const username=document.getElementById("signUpUsername").value.trim();
  const email=document.getElementById("signUpEmail").value.trim();
  const studentId=document.getElementById("signUpStudentId").value.trim();
  if(!fullName||!username||!email||!studentId) return alert("Fill all fields");

  const existing=await db.collection("users").where("username","==",username).get();
  if(!existing.empty) return alert("Username taken");

  const userRef=await db.collection("users").add({
    full_name: fullName,
    username,
    email,
    student_id: studentId,
    ojt_location:"",
    target_hours:0
  });
  localStorage.setItem("userDocId",userRef.id);
  localStorage.setItem("loggedIn", "true");
  window.location.href="homepage.html";
});

document.getElementById("loginBtn")?.addEventListener("click",async()=>{
  const username=document.getElementById("loginUsername").value.trim();
  const studentId=document.getElementById("loginStudentId").value.trim();
  if(!username||!studentId) return alert("Fill all fields");

  const query=await db.collection("users")
    .where("username","==",username)
    .where("student_id","==",studentId)
    .get();
  if(query.empty) return alert("Invalid login");

  localStorage.setItem("userDocId",query.docs[0].id);
  localStorage.setItem("loggedIn", "true");
  window.location.href="homepage.html";
});

function parseTime(t){ const [h,m]=t.split(":").map(Number); return h+m/60; }

async function getTotalRecordedHours(userDocId){
  const snapshot=await db.collection("users").doc(userDocId).collection("ojt_records").get();
  let total=0;
  snapshot.forEach(doc=>{
    const d=doc.data();
    if(d.am_in&&d.am_out&&d.pm_in&&d.pm_out){
      total += parseTime(d.am_out)-parseTime(d.am_in);
      total += parseTime(d.pm_out)-parseTime(d.pm_in);
    }
  });
  return total;
}

async function updateGreetingCard(){
  const userDocId = localStorage.getItem("userDocId");
  if(!userDocId) return;
  const userDoc=await db.collection("users").doc(userDocId).get();
  const data=userDoc.data();
  document.getElementById("greeting").textContent=`Hello, ${data.username}!`;

  if(!data.ojt_location||!data.target_hours){
    document.getElementById("ojtPopup").style.display="flex";
    document.getElementById("ojtInfo").style.display="none";
    return;
  }

  document.getElementById("ojtPopup").style.display="none";
  document.getElementById("ojtInfo").style.display="block";
  document.getElementById("companyName").textContent=data.ojt_location;

  const total = await getTotalRecordedHours(userDocId);
  localStorage.setItem("overallTotalHours", total);
  const remaining = Math.max(data.target_hours-total,0);
  document.getElementById("remainingHours").textContent=`${Math.floor(remaining)}h Remaining`;
}

document.getElementById("saveOjtBtn")?.addEventListener("click", async()=>{
  const loc=document.getElementById("ojtLocation").value;
  const target=parseFloat(document.getElementById("targetHours").value);
  if(!loc||!target) return alert("Fill all fields");
  const userDocId=localStorage.getItem("userDocId");
  await db.collection("users").doc(userDocId).update({ojt_location:loc,target_hours:target});
  updateGreetingCard();
});

document.getElementById("saveLogBtn")?.addEventListener("click", async()=>{
  const date=document.getElementById("logDate").value;
  const am_in=document.getElementById("amIn").value;
  const am_out=document.getElementById("amOut").value;
  const pm_in=document.getElementById("pmIn").value;
  const pm_out=document.getElementById("pmOut").value;
  if(!date||!am_in||!am_out||!pm_in||!pm_out) return alert("Fill all fields");

  const userDocId = localStorage.getItem("userDocId");
  await db.collection("users").doc(userDocId).collection("ojt_records").add({date,am_in,am_out,pm_in,pm_out});
  alert("Log saved!");
  loadLogbook();
  updateGreetingCard();
});

async function loadLogbook(){
  const userDocId=localStorage.getItem("userDocId");
  const snapshot=await db.collection("users").doc(userDocId).collection("ojt_records").orderBy("date","asc").get();
  const tbody=document.getElementById("logTableBody");
  tbody.innerHTML="";

  let overallTotal=0;
  snapshot.forEach(doc=>{
    const d=doc.data();
    const am=parseTime(d.am_out)-parseTime(d.am_in);
    const pm=parseTime(d.pm_out)-parseTime(d.pm_in);
    const total=am+pm;
    overallTotal += total;
    const row = `
    <tr>
        <td>${d.date}</td>
        <td>${d.am_in}</td>
        <td>${d.am_out}</td>
        <td>${d.pm_in}</td>
        <td>${d.pm_out}</td>
        <td>${total.toFixed(2)}</td>
        <td>
            <button onclick="deleteLog('${doc.id}')" class="danger">Delete</button>
        </td>
    </tr>`;
    tbody.innerHTML += row;
  });
  localStorage.setItem("overallTotalHours",overallTotal);
}

async function deleteLog(logId) {
  const confirmDelete = confirm("Delete this log entry?");

  if (!confirmDelete) return;

  const userDocId = localStorage.getItem("userDocId");

  try {
    await db.collection("users")
      .doc(userDocId)
      .collection("ojt_records")
      .doc(logId)
      .delete();

    alert("Log deleted!");

    loadLogbook();       
    updateGreetingCard(); 

  } catch (error) {
    console.error(error);
    alert("Error deleting log");
  }
}