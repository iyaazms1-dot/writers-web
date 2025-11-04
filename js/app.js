document.addEventListener("DOMContentLoaded",()=>{
  const modal=document.getElementById("loginModal");
  const btn=document.getElementById("submitLogin");
  const input=document.getElementById("userName");
  const saved=localStorage.getItem("writerName");

  if(saved){modal.style.display="none";console.log("Welcome back "+saved);}
  btn?.addEventListener("click",()=>{
    const name=input.value.trim()||"Guest";
    localStorage.setItem("writerName",name);
    modal.style.display="none";
  });
});
