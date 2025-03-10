// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Helper: Roll a single exploding d6 (returns {total, rolls})
function rollExplodingDie() {
  let rolls = [];
  let roll;
  do {
    roll = Math.floor(Math.random() * 6) + 1;
    rolls.push(roll);
  } while (roll === 6);
  return { total: rolls.reduce((a, b) => a + b, 0), rolls };
}

// Helper: Base dice roll (2d6, exploding) – one for positive and one for negative
function rollBaseDice() {
  const plus = rollExplodingDie();
  const minus = rollExplodingDie();
  const total = plus.total - minus.total;
  const isBoxcars = (plus.rolls[0] === 6 && minus.rolls[0] === 6);
  return { total, plusRolls: plus.rolls, minusRolls: minus.rolls, isBoxcars };
}

// Helper: Roll a single d6 (non-exploding) for initiative
function rollInitiative() {
  const roll = Math.floor(Math.random() * 6) + 1;
  return roll;
}

// Function to create a new enemy card; optional parameter 'data' prepopulates fields
function addEnemyCard(data = {}) {
  const container = document.createElement('div');
  container.className = 'enemy-card';

  // Create header: name input and enemy type dropdown
  container.innerHTML = `
    <div class="field-group">
      <label>Enemy Name:</label>
      <input type="text" class="enemy-name" value="${data.name || ''}" />
    </div>
    <div class="field-group">
      <label>Enemy Type:</label>
      <select class="enemy-type">
        <option value="mook-hand" ${data.type === 'mook-hand' ? 'selected' : ''}>Mook (Hand-to-Hand)</option>
        <option value="mook-ranged" ${data.type === 'mook-ranged' ? 'selected' : ''}>Mook (Ranged)</option>
        <option value="featured" ${data.type === 'featured' ? 'selected' : ''}>Featured Foe</option>
        <option value="boss" ${data.type === 'boss' ? 'selected' : ''}>Boss</option>
        <option value="uber" ${data.type === 'uber' ? 'selected' : ''}>Uber Boss</option>
      </select>
    </div>
    
    <!-- Stat fields -->
    <div class="stat-field">
      <label>Main Attack:</label>
      <input type="number" class="main-attack-base" placeholder="Base value" value="${data.mainAttackBase || ''}" />
      <button class="roll-main">Roll</button>
      <span class="stat-result main-result">${data.mainResult || ''}</span>
    </div>
    
    <div class="stat-field">
      <label>Backup Attack:</label>
      <input type="number" class="backup-attack-base" placeholder="Base value" value="${data.backupAttackBase || ''}" />
      <button class="roll-backup">Roll</button>
      <span class="stat-result backup-result">${data.backupResult || ''}</span>
    </div>
    
    <div class="stat-field">
      <label>Defense:</label>
      <input type="number" class="defense-base" placeholder="Base value" value="${data.defenseBase || ''}" />
      <button class="roll-defense">Roll</button>
      <span class="stat-result defense-result">${data.defenseResult || ''}</span>
    </div>
    
    <div class="stat-field">
      <label>Toughness:</label>
      <input type="number" class="toughness-base" placeholder="Base value" value="${data.toughnessBase || ''}" />
      <button class="roll-toughness">Roll</button>
      <span class="stat-result toughness-result">${data.toughnessResult || ''}</span>
    </div>
    
    <div class="speed-field">
      <label>Speed:</label>
      <input type="number" class="speed-base" placeholder="Base value" value="${data.speedBase || ''}" />
      <button class="roll-speed">Roll</button>
      <button class="roll-initiative">Initiative</button>
      <span class="stat-result speed-result">${data.speedResult || ''}</span>
    </div>
    
    <!-- Additional text areas -->
    <div class="field-group">
      <label>Enemy Schticks:</label>
      <textarea class="schticks" rows="2" placeholder="Enter schticks...">${data.schticks || ''}</textarea>
    </div>
    <div class="field-group">
      <label>Weapons:</label>
      <textarea class="weapons" rows="2" placeholder="Enter weapons...">${data.weapons || ''}</textarea>
    </div>
    <div class="field-group">
      <label>Vehicles:</label>
      <textarea class="vehicles" rows="2" placeholder="Enter vehicles...">${data.vehicles || ''}</textarea>
    </div>
    <div class="field-group">
      <label>Skills:</label>
      <textarea class="skills" rows="2" placeholder="Enter skills...">${data.skills || ''}</textarea>
    </div>
    
    <!-- Wound points counter -->
    <div class="wound-field">
      <label>Wound Points:</label>
      <input type="number" class="wound-points" value="${data.woundPoints || 0}" />
      <button class="inc-wounds">+</button>
    </div>
    
    <!-- Button to remove this enemy card -->
    <div class="field-group">
      <button class="remove-enemy">Remove Enemy</button>
    </div>
  `;

  // Attach event listeners for dice rolling:
  // Main Attack roll
  container.querySelector('.roll-main').addEventListener('click', function() {
    const base = Number(container.querySelector('.main-attack-base').value) || 0;
    const dice = rollBaseDice();
    const final = base + dice.total;
    let text = `Result: ${final} (Dice: +[${dice.plusRolls.join(', ')}] - [${dice.minusRolls.join(', ')}])`;
    if (dice.isBoxcars) text += ' !';
    container.querySelector('.main-result').textContent = text;
  });
  
  // Backup Attack roll
  container.querySelector('.roll-backup').addEventListener('click', function() {
    const base = Number(container.querySelector('.backup-attack-base').value) || 0;
    const dice = rollBaseDice();
    const final = base + dice.total;
    let text = `Result: ${final} (Dice: +[${dice.plusRolls.join(', ')}] - [${dice.minusRolls.join(', ')}])`;
    if (dice.isBoxcars) text += ' !';
    container.querySelector('.backup-result').textContent = text;
  });
  
  // Defense roll
  container.querySelector('.roll-defense').addEventListener('click', function() {
    const base = Number(container.querySelector('.defense-base').value) || 0;
    const dice = rollBaseDice();
    const final = base + dice.total;
    let text = `Result: ${final} (Dice: +[${dice.plusRolls.join(', ')}] - [${dice.minusRolls.join(', ')}])`;
    if (dice.isBoxcars) text += ' !';
    container.querySelector('.defense-result').textContent = text;
  });
  
  // Toughness roll
  container.querySelector('.roll-toughness').addEventListener('click', function() {
    const base = Number(container.querySelector('.toughness-base').value) || 0;
    const dice = rollBaseDice();
    const final = base + dice.total;
    let text = `Result: ${final} (Dice: +[${dice.plusRolls.join(', ')}] - [${dice.minusRolls.join(', ')}])`;
    if (dice.isBoxcars) text += ' !';
    container.querySelector('.toughness-result').textContent = text;
  });
  
  // Speed roll (base mechanic)
  container.querySelector('.roll-speed').addEventListener('click', function() {
    const base = Number(container.querySelector('.speed-base').value) || 0;
    const dice = rollBaseDice();
    const final = base + dice.total;
    let text = `Result: ${final} (Dice: +[${dice.plusRolls.join(', ')}] - [${dice.minusRolls.join(', ')}])`;
    if (dice.isBoxcars) text += ' !';
    container.querySelector('.speed-result').textContent = text;
  });
  
  // Speed Initiative roll (1d6 non-exploding)
  container.querySelector('.roll-initiative').addEventListener('click', function() {
    const base = Number(container.querySelector('.speed-base').value) || 0;
    const roll = rollInitiative();
    const final = base + roll;
    const text = `Initiative: ${final} (Roll: ${roll})`;
    container.querySelector('.speed-result').textContent = text;
  });
  
  // Wound points increment button
  container.querySelector('.inc-wounds').addEventListener('click', function() {
    const woundInput = container.querySelector('.wound-points');
    woundInput.value = Number(woundInput.value) + 1;
  });
  
  // Remove enemy card button
  container.querySelector('.remove-enemy').addEventListener('click', function() {
    container.remove();
  });
  
  document.getElementById('enemiesContainer').appendChild(container);
}

// Event listener for Add Enemy button
document.getElementById('addEnemyBtn').addEventListener('click', function() {
  addEnemyCard();
});

// SAVE functionality: gather all enemy card data and trigger download as JSON
document.getElementById('saveBtn').addEventListener('click', function() {
  const enemyCards = document.querySelectorAll('.enemy-card');
  const data = [];
  enemyCards.forEach(card => {
    data.push({
      name: card.querySelector('.enemy-name').value,
      type: card.querySelector('.enemy-type').value,
      mainAttackBase: card.querySelector('.main-attack-base').value,
      mainResult: card.querySelector('.main-result').textContent,
      backupAttackBase: card.querySelector('.backup-attack-base').value,
      backupResult: card.querySelector('.backup-result').textContent,
      defenseBase: card.querySelector('.defense-base').value,
      defenseResult: card.querySelector('.defense-result').textContent,
      toughnessBase: card.querySelector('.toughness-base').value,
      toughnessResult: card.querySelector('.toughness-result').textContent,
      speedBase: card.querySelector('.speed-base').value,
      speedResult: card.querySelector('.speed-result').textContent,
      schticks: card.querySelector('.schticks').value,
      weapons: card.querySelector('.weapons').value,
      vehicles: card.querySelector('.vehicles').value,
      skills: card.querySelector('.skills').value,
      woundPoints: card.querySelector('.wound-points').value
    });
  });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enemy-data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// IMPORT functionality: load JSON file and recreate enemy cards
document.getElementById('importBtn').addEventListener('click', function() {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      // Clear existing enemy cards
      document.getElementById('enemiesContainer').innerHTML = '';
      // Create enemy cards for each imported item
      data.forEach(item => {
        addEnemyCard(item);
      });
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  reader.readAsText(file);
});
