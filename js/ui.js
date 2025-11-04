// ui.js - animations and Muse
document.addEventListener('DOMContentLoaded', () => {
  // welcome typewriter
  const lines = document.querySelectorAll('.poem-lines .line');
  if(lines && lines.length){
    let i=0;
    function showNext(){
      if(i>=lines.length) return;
      lines[i].classList.add('visible');
      i++;
      setTimeout(showNext, 700);
    }
    setTimeout(showNext, 600);
  }

  // Muse orb (basic suggestions)
  let museEnabled = true;
  const museToggle = document.getElementById('toggleMuse');
  if(museToggle) museToggle.addEventListener('change', ()=> museEnabled = museToggle.checked);

  // create floating orb on writers page
  const isWriters = location.pathname.endsWith('writers.html') || location.pathname.endsWith('/writers.html');
  if(isWriters){
    const orb = document.createElement('div');
    orb.id = 'museOrb';
    orb.style.position = 'fixed';
    orb.style.right = '18px';
    orb.style.bottom = '80px';
    orb.style.width = '56px';
    orb.style.height = '56px';
    orb.style.borderRadius = '50%';
    orb.style.background = 'radial-gradient(circle at 30% 30%, #fff2, #ffd93d)';
    orb.style.boxShadow = '0 8px 30px rgba(255,217,61,0.12)';
    orb.style.display = 'flex';
    orb.style.alignItems = 'center';
    orb.style.justifyContent = 'center';
    orb.style.cursor = 'pointer';
    orb.style.zIndex = 200;
    orb.textContent = '✨';
    document.body.appendChild(orb);

    orb.addEventListener('click', () => {
      if(!museEnabled) return alert('Muse is turned off in Profile settings');
      // very light-weight suggestion: take last line and return 3 suggestions (rule-based)
      const ta = document.getElementById('poemInput');
      const txt = (ta?.value || '').trim();
      const lastLine = txt.split('\n').filter(Boolean).pop() || '';
      const suggestions = suggestLines(lastLine);
      const pick = prompt('LunaR suggestions:\n1) '+suggestions[0]+'\n2) '+suggestions[1]+'\n3) '+suggestions[2]+'\n\nType 1/2/3 to insert, or Cancel', '1');
      if(pick && ['1','2','3'].includes(pick)){
        ta.value = ta.value + '\n' + suggestions[Number(pick)-1];
      }
    });
  }

  function suggestLines(prefix){
    const seed = ['where stars','beneath the','inside the','a quiet','the moon','the sky'];
    // simple combos
    const out = [];
    for(let i=0;i<3;i++){
      const p = prefix || seed[Math.floor(Math.random()*seed.length)];
      const tails = ['sings a lullaby','opens like a wound','keeps our secrets','breathes forgotten names','weaves the dark','embraces the light'];
      out.push(capitalize(firstWords(p) + ' ' + tails[Math.floor(Math.random()*tails.length)]));
    }
    return out;
  }
  function firstWords(s){ return s.split(' ').slice(-2).join(' '); }
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

});
